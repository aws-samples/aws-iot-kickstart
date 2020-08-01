import { Table } from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources'
import {
	Construct,
	NestedStack,
	NestedStackProps,
	Duration,
} from '@aws-cdk/core'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { StartingPosition } from '@aws-cdk/aws-lambda'
import { Queue } from '@aws-cdk/aws-sqs'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { DeviceNamespaceSyncLambda } from '@deathstar/sputnik-infra-lambda-code/dist'
import { ExtendableGraphQLApi } from '../../../../../construct/api/graphql/ExtendableGraphQLApi'
import { namespaced } from '../../../../../utils/cdk-identity-utils'
import { DeviceServices } from './DeviceServices'

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
	readonly deviceServices: DeviceServices;

	constructor (scope: Construct, id: string, props: DeviceManagementStackProps) {
		super(scope, id, props)

		const { deviceTable, graphQLApi } = props
		const deviceServices = new DeviceServices(this, 'DeviceServices', {
			...props,
		})

		const deviceNamespaceSync = new DeviceNamespaceSyncLambda(
			scope,
			'DeviceNamespaceSync',
			{
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
			},
		)

		const deadLetterQueue = new Queue(this, 'DeadLetterQueue')

		deviceNamespaceSync.addEventSource(
			new DynamoEventSource(deviceTable, {
				startingPosition: StartingPosition.TRIM_HORIZON,
				batchSize: 1,
				retryAttempts: 3,
				onFailure: new SqsDlq(deadLetterQueue),
			}),
		)

		Object.assign(this, {
			deviceServices,
		})
	}
}
