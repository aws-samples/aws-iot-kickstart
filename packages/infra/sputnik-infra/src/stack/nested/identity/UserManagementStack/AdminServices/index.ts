/* eslint-disable no-template-curly-in-string */
import * as path from 'path'
import {
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from '@aws-cdk/aws-iam'
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { Construct, Stack } from '@aws-cdk/core'
import { ServicePrincipals } from 'cdk-constants'
import {
	Logs as LogsActions,
	IAM as IAMActions,
} from 'cdk-iam-actions/lib/actions'
import { UserPool } from '@aws-cdk/aws-cognito'
import { MappingTemplate } from '@aws-cdk/aws-appsync'
import { INTERNAL_GROUPS, INTERNAL_TENANT } from '@deathstar/sputnik-core'
import { AdminServiceLambda } from '@deathstar/sputnik-infra-lambda-code/dist'
import { ExtendableGraphQLApi } from '../../../../../construct/api/graphql/ExtendableGraphQLApi'

export interface AdminServicesProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly userPool: UserPool
	readonly tenantRole: Role
}

export class AdminServices extends Construct {
	readonly lambdaFunction: LambdaFunction;

	readonly lambdaRole: Role;

	constructor (scope: Construct, id: string, props: AdminServicesProps) {
		super(scope, id)

		const { userPool, tenantRole, graphQLApi } = props

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
								Stack.of(this).formatArn({
									service: 'logs',
									resource: 'log-group:*',
								}),
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
							resources: [tenantRole.roleArn],
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

		const lambdaFunction = new AdminServiceLambda(scope, 'LambdaFunction', {
			role: lambdaRole,
			environment: {
				USER_POOL_ID: userPool.userPoolId,
				TENANT_ROLE_ARN: tenantRole.roleArn,
				INTERNAL_TENANT,
				INTERNAL_GROUPS: INTERNAL_GROUPS.join(','),
			},
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
			lambdaFunction,
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
							#if( \${context.arguments.nextToken} )
									,
									"nextToken": "\${context.arguments.nextToken}"
							#end
					}
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"users": $util.toJson($ctx.result.users),
					#if( \${ctx.result.nextToken} )
							"nextToken": "\${ctx.result.nextToken}",
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
					"groups": $util.toJson($ctx.result.groups),
					#if( \${ctx.result.nextToken} )
							"nextToken": "\${ctx.result.nextToken}",
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
