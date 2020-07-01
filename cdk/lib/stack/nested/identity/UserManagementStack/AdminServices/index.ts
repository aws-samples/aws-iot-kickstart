/* eslint-disable no-template-curly-in-string */
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { Construct, Duration, Stack } from '@aws-cdk/core'
import { ServicePrincipals } from 'cdk-constants'
import { Logs as LogsActions, IAM as IAMActions } from 'cdk-iam-actions/lib/actions'
import * as path from 'path'
import { uniqueIdHash } from '../../../../../utils/cdk-identity-utils'
import { UserPool } from '@aws-cdk/aws-cognito'
import { ExtendableGraphQLApi } from '../../../../../construct/api/graphql/ExtendableGraphQLApi'
import { MappingTemplate } from '@aws-cdk/aws-appsync'
import { NpmCode } from '../../../../../construct/lambda/NpmCode'
import { INTERNAL_GROUPS, INTERNAL_TENANT } from '../../constants'

export interface AdminServicesProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly userPool: UserPool
	readonly tenantRole: Role
}

export class AdminServices extends Construct {
	readonly lambdaFunction: LambdaFunction
	readonly lambdaRole: Role

	constructor (scope: Construct, id: string, props: AdminServicesProps) {
		super(scope, id)

		const { userPool, tenantRole, graphQLApi } = props

		/***********************************************************************
		 *** SCHEMA
		 ***********************************************************************/
		graphQLApi.extendSchemaFile(path.join(__dirname, 'schema.admin.graphql'))

		/***********************************************************************
		 *** LAMBDA
		 ***********************************************************************/

		const lambdaRole = new Role(this, 'LambdaRole', {
			assumedBy: new ServicePrincipal(ServicePrincipals.LAMBDA),
			inlinePolicies: {
				cloudwatchLogAccess: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								LogsActions.CREATE_LOG_GROUP,
								LogsActions.CREATE_LOG_STREAM,
								LogsActions.PUT_LOG_EVENTS,
							],
							resources: [
								Stack.of(this).formatArn({ service: 'logs', resource: 'log-group:*' }),
							],
						}),
					],
				}),
				adminServiceIAMPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								// TODO: [SECURITY] Too permissive for now.
								'cognito-idp:*',
								// 'cognito-idp:ListUsers',
								// 'cognito-idp:AdminEnableUser',
								// 'cognito-idp:AdminDisableUser',
								// 'cognito-idp:AdminDeleteUser',
								// 'cognito-idp:AdminAddUserToGroup',
							],
							resources: ['*'],
						}),
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								// TODO: Move this to "Admin" only role... not created yet
								IAMActions.PASS_ROLE,
							],
							// TODO: [SECURITY] Too permissive for now.
							resources: [
								tenantRole.roleArn,
							],
						}),
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								// TODO: [SECURITY] Too permissive for now.
								'iot:*',
								'greengrass:*',
							],
							resources: ['*'],
						}),
					],
				}),
			},
		})

		const lambdaFunction = new LambdaFunction(scope, 'LambdaFunction', {
			functionName: `Sputnik_AdminServices_${uniqueIdHash(this)}`,
			description: 'Sputnik Admin microservice',
			handler: 'index.handler',
			runtime: Runtime.NODEJS_12_X,
			timeout: Duration.seconds(10),
			memorySize: 256,
			role: lambdaRole,
			environment: {
				USER_POOL_ID: userPool.userPoolId,
				TENANT_ROLE_ARN: tenantRole.roleArn,
				INTERNAL_TENANT,
				INTERNAL_GROUPS: INTERNAL_GROUPS.join(','),
			},
			code: NpmCode.fromNpmPackageDir(this, path.join(__dirname, '/lambda/admin')),
		})

		/***********************************************************************
		 *** PERMISSIONS
		 ***********************************************************************/

		// Grant api access to lambda
		graphQLApi.grantLambdaInvoke(lambdaFunction)

		// Add lambda datasource
		const lambdaDatasource = graphQLApi.addLambdaDataSource(
			'AdminServicesLambda',
			'Admin service lambda data source',
			lambdaFunction
		)

		/***********************************************************************
		 *** QUERIES
		 ***********************************************************************/

		lambdaDatasource.createResolver({
			typeName: 'Query',
			fieldName: 'listUsers',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "listUsers"
							#if( \${context.arguments.limit} )
									,
									"limit": \${context.arguments.limit}
							#end
							#if( \${context.arguments.paginationToken} )
									,
									"paginationToken": "\${context.arguments.paginationToken}"
							#end
					}
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"Users": $util.toJson($ctx.result.Users),
					#if( \${ctx.result.PaginationToken} )
							"PaginationToken": "\${ctx.result.PaginationToken}",
					#end
			}`),
		})
		lambdaDatasource.createResolver({
			typeName: 'Query',
			fieldName: 'getUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "getUser",
							"username": "\${ctx.args.username}"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Query',
			fieldName: 'listGroups',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "listGroups"
							#if( \${context.arguments.limit} )
									,
									"limit": \${context.arguments.limit}
							#end
							#if( \${context.arguments.nextToken} )
									,
									"nextToken": "\${context.arguments.nextToken}"
							#end
					}
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"Groups": $util.toJson($ctx.result.Groups),
					#if( \${ctx.result.NextToken} )
							"NextToken": "\${ctx.result.NextToken}",
					#end
			}`),
		})
		lambdaDatasource.createResolver({
			typeName: 'Query',
			fieldName: 'listTenants',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "listTenants"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})

		/***********************************************************************
		 *** MUTATIONS
		 ***********************************************************************/

		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'deleteUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "deleteUser",
							"username": "\${context.arguments.username}"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'disableUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "disableUser",
							"username": "\${context.arguments.username}"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'enableUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "enableUser",
							"username": "\${context.arguments.username}"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'inviteUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "inviteUser",
							"name": "\${context.arguments.name}",
							"email": "\${context.arguments.email}",
							"groups": $util.toJson($context.arguments.groups)
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'updateUser',
			requestMappingTemplate: MappingTemplate.fromString(`{
                    "version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "updateUser",
							"username": "\${context.arguments.username}",
							"groups": $util.toJson($context.arguments.groups)
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		lambdaDatasource.createResolver({
			typeName: 'Mutation',
			fieldName: 'addTenant',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "addTenant",
							"name": "\${context.arguments.name}",
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})

		Object.assign(this, {
			lambdaRole,
			lambdaFunction,
		})
	}
}
