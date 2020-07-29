/* eslint-disable no-template-curly-in-string */
import { AttributeType, ProjectionType, Table, StreamViewType } from '@aws-cdk/aws-dynamodb'
import { Construct, NestedStack, NestedStackProps, RemovalPolicy, Stack } from '@aws-cdk/core'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { namespaced } from '../../../../../utils/cdk-identity-utils'

export type DeviceManagementPersistentStackProps = NestedStackProps

export class DeviceManagementPersistentStack extends NestedStack {
	readonly deploymentTable: Table

	readonly deviceBlueprintTable: Table

	readonly deviceTypeTable: Table

	readonly deviceTable: Table

	readonly settingTable: Table

	readonly systemBlueprintTable: Table

	readonly systemTable: Table

	readonly dataStoreTable: Table

	readonly iotConnectPolicy: IotCfnPolicy

	constructor (scope: Construct, id: string, props: DeviceManagementPersistentStackProps) {
		super(scope, id, props)

		/***********************************************************************
		*** IOT CONNECT
		***********************************************************************/

		this.iotConnectPolicy = new IotCfnPolicy(this, 'IoTConnectPolicy', {
			policyName: namespaced(this, 'IoTConnectCertificates'),
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Action: 'iot:Connect',
						Resource: [
							Stack.of(this).formatArn({ service: 'iot', resource: 'client', resourceName: '${iot:Certificate.Subject.CommonName}' }),
							Stack.of(this).formatArn({ service: 'iot', resource: 'client', resourceName: '${iot:Certificate.Subject.CommonName}-*' }),
						],
						Condition: {
							StringEquals: {
								'iot:Certificate.Subject.Organization': 'sputnik',
							},
						},
					},
					{
						Effect: 'Allow',
						Action: 'greengrass:Discover',
						Resource: [
							'*',
						],
					},
				],
			},
		})

		/***********************************************************************
		*** TABLES
		***********************************************************************/

		this.deploymentTable = new Table(this, 'DeploymentTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'Deployment'),
			partitionKey: {
				name: 'thingId',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'deploymentId',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.deviceBlueprintTable = new Table(this, 'DeviceBlueprintTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'DeviceBlueprint'),
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.deviceTypeTable = new Table(this, 'DeviceTypeTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'DeviceType'),
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.deviceTable = new Table(this, 'DeviceTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'Device'),
			partitionKey: {
				name: 'thingId',
				type: AttributeType.STRING,
			},
			readCapacity: 10,
			writeCapacity: 10,
			serverSideEncryption: true,
			stream: StreamViewType.NEW_AND_OLD_IMAGES,
		})
		this.deviceTable.addGlobalSecondaryIndex({
			indexName: 'deviceTypeId',
			partitionKey: {
				name: 'deviceTypeId',
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.ALL,
			readCapacity: 10,
			writeCapacity: 10,
		})
		this.deviceTable.addGlobalSecondaryIndex({
			indexName: 'deviceBlueprintId',
			partitionKey: {
				name: 'deviceBlueprintId',
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.ALL,
			readCapacity: 10,
			writeCapacity: 10,
		})

		this.settingTable = new Table(this, 'SettingTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'Setting'),
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.systemBlueprintTable = new Table(this, 'SystemBlueprintTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'SystemBlueprint'),
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.systemTable = new Table(this, 'SystemTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'System'),
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			readCapacity: 5,
			writeCapacity: 5,
			serverSideEncryption: true,
		})

		this.dataStoreTable = new Table(this, 'DataStoreTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			tableName: namespaced(this, 'DataStore'),
			partitionKey: {
				name: 'ThingNameAndMetric',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'Timestamp',
				type: AttributeType.NUMBER,
			},
			readCapacity: 20,
			writeCapacity: 20,
			serverSideEncryption: true,
			timeToLiveAttribute: 'ExpirationTime',
		})
	}
}
