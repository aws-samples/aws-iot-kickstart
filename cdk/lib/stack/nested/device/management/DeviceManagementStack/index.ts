import * as path from 'path'
import { Table } from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources'
import { Construct, NestedStack, NestedStackProps, Duration } from '@aws-cdk/core'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { Queue } from '@aws-cdk/aws-sqs'
import { ExtendableGraphQLApi } from '../../../../../construct/api/graphql/ExtendableGraphQLApi'
import { DeviceServices } from './DeviceServices'
import { namespaced } from '../../../../../utils/cdk-identity-utils'
import { NpmCode } from '../../../../../construct/lambda/NpmCode'
import { StartingPosition } from '@aws-cdk/aws-lambda'
import { DEFAULT_NAMESPACE } from '../constants'

export interface DeviceManagementStackProps extends NestedStackProps {
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

export class DeviceManagementStack extends NestedStack {
	readonly deviceServices: DeviceServices

	constructor (scope: Construct, id: string, props: DeviceManagementStackProps) {
		super(scope, id, props)

		const { deviceTable, graphQLApi } = props
		const deviceServices = new DeviceServices(this, 'DeviceServices', {
			...props,
		})

		const deviceNamespaceSync = new lambda.Function(scope, 'DeviceNamespaceSync', {
			functionName: namespaced(this, 'DeviceNamespaceSync'),
			description: 'Handles changed to Device.namespace and trigger MQTT topic to the device to update the information. Will also handle re-deployment in specific cases',
			handler: 'index.handler',
			runtime: lambda.Runtime.NODEJS_12_X,
			timeout: Duration.seconds(10),
			memorySize: 256,
			initialPolicy: [
				new iam.PolicyStatement({
					actions: ['appsync:GraphQL'],
					resources: [
						graphQLApi.arn + '/types/Mutation/fields/addDeployment',
					],
					effect: iam.Effect.ALLOW,
				}),
				new iam.PolicyStatement({
					actions: ['iot:Connect', 'iot:Publish', 'iot:DescribeEndpoint'],
					resources: ['*'],
					effect: iam.Effect.ALLOW,
				}),
			],
			environment: {
				GRAPHQL_ENDPOINT: graphQLApi.graphQlUrl,
				DEFAULT_NAMESPACE,
			},
			code: NpmCode.fromNpmPackageDir(this, path.join(__dirname, 'lambda')),
		})

		const deadLetterQueue = new Queue(this, 'DeadLetterQueue')

		deviceNamespaceSync.addEventSource(new DynamoEventSource(deviceTable, {
			startingPosition: StartingPosition.TRIM_HORIZON,
			batchSize: 1,
			retryAttempts: 3,
			onFailure: new SqsDlq(deadLetterQueue),
		}))

		Object.assign(this, {
			deviceServices,
		})
	}
}
