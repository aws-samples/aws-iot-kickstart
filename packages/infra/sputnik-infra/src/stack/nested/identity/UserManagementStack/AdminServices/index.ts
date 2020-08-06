/* eslint-disable no-template-curly-in-string */
import {
	Role,
} from '@aws-cdk/aws-iam'
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { Construct } from '@aws-cdk/core'
import { UserPool } from '@aws-cdk/aws-cognito'
import { MappingTemplate } from '@aws-cdk/aws-appsync'
import { AdminServiceLambda } from '@deathstar/sputnik-infra-lambda-code/dist'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'

export interface AdminServicesProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly userPool: UserPool
	readonly tenantRole: Role
}

export class AdminServices extends Construct {
	readonly lambdaFunction: LambdaFunction;

	constructor (scope: Construct, id: string, props: AdminServicesProps) {
		super(scope, id)

		const { userPool, tenantRole, graphQLApi } = props

		/***********************************************************************
		 *** LAMBDA
		 ***********************************************************************/

		const lambdaFunction = new AdminServiceLambda(this, 'LambdaFunction', {
			dependencies: {
				userPool,
				tenantRole,
			}
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
			lambdaFunction,
		})
	}
}
