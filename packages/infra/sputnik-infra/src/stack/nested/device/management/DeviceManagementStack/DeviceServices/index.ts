/* eslint-disable no-template-curly-in-string */
import { Table } from '@aws-cdk/aws-dynamodb'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { Construct } from '@aws-cdk/core'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import {
	MappingTemplate,
	DynamoDbDataSource,
	LambdaDataSource,
} from '@aws-cdk/aws-appsync'
import { DevicesServiceLambda } from '@deathstar/sputnik-infra-lambda-code/dist'

export interface DeviceServicesProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly deploymentTable: Table
	readonly deviceBlueprintTable: Table
	readonly deviceTypeTable: Table
	readonly deviceTable: Table
	readonly settingTable: Table
	readonly systemBlueprintTable: Table
	readonly systemTable: Table
	readonly dataStoreTable: Table
	readonly iotConnectPolicy: IotCfnPolicy
}

export class DeviceServices extends Construct {
	readonly lambdaFunction: LambdaFunction;

	readonly deviceTableDataSource: DynamoDbDataSource;

	readonly deviceLambdaDataSource: LambdaDataSource;

	constructor (scope: Construct, id: string, props: DeviceServicesProps) {
		super(scope, id)

		const {
			graphQLApi,
			deviceTable,
			deviceTypeTable,
			settingTable,
			deploymentTable,
			deviceBlueprintTable,
			systemBlueprintTable,
			systemTable,
			dataStoreTable,
			iotConnectPolicy,
		} = props

		/***********************************************************************
		 *** LAMBDA
		 ***********************************************************************/

		const lambdaFunction = new DevicesServiceLambda(this, 'LambdaFunction', {
			dependencies: {
				settingTable,
				deviceTable,
				deviceTypeTable,
				iotConnectPolicy,
			}
		})

		/***********************************************************************
		 *** PERMISSIONS
		 ***********************************************************************/

		// Grant dynamodb table access
		graphQLApi.grantDynamoDbReadWrite(deploymentTable)
		graphQLApi.grantDynamoDbReadWrite(deviceBlueprintTable)
		graphQLApi.grantDynamoDbReadWrite(deviceTypeTable)
		graphQLApi.grantDynamoDbReadWrite(deviceTable)
		graphQLApi.grantDynamoDbReadWrite(settingTable)
		graphQLApi.grantDynamoDbReadWrite(systemBlueprintTable)
		graphQLApi.grantDynamoDbReadWrite(systemTable)
		graphQLApi.grantDynamoDbReadWrite(dataStoreTable)
		// Grand lambda invoke access
		graphQLApi.grantLambdaInvoke(lambdaFunction)

		/***********************************************************************
		 *** DATA SOURCE
		 ***********************************************************************/

		const deviceTableDataSource = graphQLApi.addDynamoDbDataSource(
			'DeviceTable',
			'Device table data source',
			deviceTable,
		)

		const deviceLambdaDataSource = graphQLApi.addLambdaDataSource(
			'DeviceServicesLambda',
			'Device service lambda data source',
			lambdaFunction,
		)

		/***********************************************************************
		 *** QUERIES
		 ***********************************************************************/
		deviceTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'listDevices',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Scan",
					#if( $ctx.args.limit )
							"limit": $ctx.args.limit,
					#end
					#if( \${ctx.args.nextToken} )
							"nextToken": "\${ctx.args.nextToken}"
					#end
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"devices": $util.toJson($ctx.result.items),
					#if( \${ctx.result.nextToken} )
							"nextToken": "\${ctx.result.nextToken}",
					#end
			}`),
		})
		deviceTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'listDevicesOfDeviceType',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Query",
					"index" : "deviceTypeId",
					#if( $ctx.args.limit )
							"limit": $ctx.args.limit,
					#end
					#if( \${ctx.args.nextToken} )
							"nextToken": "\${ctx.args.nextToken}",
					#end
					"query" : {
							"expression" : "deviceTypeId = :deviceTypeId",
							"expressionValues" : {
									":deviceTypeId" : $util.dynamodb.toDynamoDBJson($ctx.args.deviceTypeId)
							}
					}
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"devices": $util.toJson($ctx.result.items),
					#if( \${ctx.result.nextToken} )
							"nextToken": "\${ctx.result.nextToken}",
					#end
			}`),
		})
		deviceTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'listDevicesWithDeviceBlueprint',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Query",
					"index" : "deviceBlueprintId",
					#if( $ctx.args.limit )
							"limit": $ctx.args.limit,
					#end
					#if( \${ctx.args.nextToken} )
							"nextToken": "\${ctx.args.nextToken}",
					#end
					"query" : {
							"expression" : "deviceBlueprintId = :deviceBlueprintId",
							"expressionValues" : {
									":deviceBlueprintId" : $util.dynamodb.toDynamoDBJson($ctx.args.deviceBlueprintId)
							}
					}
			}`),
			responseMappingTemplate: MappingTemplate.fromString(`{
					"devices": $util.toJson($ctx.result.items),
					#if( \${ctx.result.nextToken} )
							"nextToken": "\${ctx.result.nextToken}",
					#end
			}`),
		})
		deviceTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getDevice',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "GetItem",
					"key" : {
							"thingId" : $util.dynamodb.toDynamoDBJson($ctx.args.thingId)
					}
			}`),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})
		deviceLambdaDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getDeviceStats',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "getDeviceStats"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})

		/***********************************************************************
		 *** MUTATIONS
		 ***********************************************************************/
		deviceLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'addDevice',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "addDevice",
							"name": "$ctx.args.name",
							"deviceTypeId": "$ctx.args.deviceTypeId",
							"deviceBlueprintId": "$ctx.args.deviceBlueprintId"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		deviceLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'deleteDevice',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "deleteDevice",
							"thingId": "$ctx.args.thingId"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		deviceLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'updateDevice',
			requestMappingTemplate: MappingTemplate.fromString(`{
				"version" : "2017-02-28",
				"operation" : "Invoke",
				"payload": {
						"cmd": "updateDevice",
						"thingId": "$ctx.args.thingId",
						"name": "$ctx.args.name",

	#if ($util.isNullOrBlank($ctx.args.namespace))
						"namespace": "${DEFAULT_NAMESPACE}",
	#else
						"namespace": "$ctx.args.namespace",
	#end

						"spec": $util.toJson($ctx.args.spec),
						"deviceTypeId": "$ctx.args.deviceTypeId",
						"deviceBlueprintId": "$ctx.args.deviceBlueprintId"
				}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		deviceLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'createCertificate',
			requestMappingTemplate: MappingTemplate.fromString(`{
					"version" : "2017-02-28",
					"operation" : "Invoke",
					"payload": {
							"cmd": "createCertificate",
							"csr": "$util.escapeJavaScript($ctx.args.csr)",
							"thingId": "$ctx.args.thingId"
					}
			}`),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		deviceTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'updateDeviceNamespace',
			requestMappingTemplate: MappingTemplate.fromString(`{
					#if ($util.isNullOrBlank($ctx.args.namespace))
					#set ($ctx.args.namespace = "${DEFAULT_NAMESPACE}")
					#end

					"version" : "2017-02-28",
					"operation" : "UpdateItem",
					"key": {
						"thingId": $util.dynamodb.toDynamoDBJson($ctx.args.thingId)
					},
					"update": {
							"expression": "SET namespace = :namespace",
							"expressionValues": {
								":namespace": $util.dynamodb.toDynamoDBJson($ctx.args.namespace)
							}
					}
			}`),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		// /***********************************************************************
		//	*** FIELD
		//	***********************************************************************/

		Object.assign(this, {
			lambdaFunction,
			deviceTableDataSource,
			deviceLambdaDataSource,
		})
	}
}
