import { IRole } from '@aws-cdk/aws-iam'
import { IBucket } from '@aws-cdk/aws-s3'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources'
import {
	Construct,
	NestedStack,
	NestedStackProps,
} from '@aws-cdk/core'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { StartingPosition } from '@aws-cdk/aws-lambda'
import { Queue } from '@aws-cdk/aws-sqs'
import { DeviceNamespaceSyncLambda } from '@deathstar/sputnik-infra-lambda-code/dist'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import { DeviceServices } from './DeviceServices'
import { DeploymentService } from './DeploymentService'

export interface DeviceManagementStackProps extends NestedStackProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly dataBucket: IBucket
	readonly deploymentTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly deviceTypeTable: ITable
	readonly deviceTable: ITable
	readonly settingTable: ITable
	readonly systemBlueprintTable: ITable
	readonly systemTable: ITable
	readonly dataStoreTable: ITable
	readonly iotConnectPolicy: IotCfnPolicy
	readonly greengrassGroupsRole: IRole
	readonly iotPolicyForGreengrassCores: IotCfnPolicy
	readonly iotEndpointAddress: string
}

export class DeviceManagementStack extends NestedStack {
	readonly deviceServices: DeviceServices

	readonly deploymentService: DeploymentService

	constructor (scope: Construct, id: string, props: DeviceManagementStackProps) {
		super(scope, id, props)

		const { deviceTable, graphQLApi } = props

		this.deviceServices = new DeviceServices(this, 'DeviceServices', {
			...props,
		})

		this.deploymentService = new DeploymentService(this, 'DeploymentService', {
			...props,
		})

		const deviceNamespaceSync = new DeviceNamespaceSyncLambda(this, 'DeviceNamespaceSync',{
			dependencies: {
				graphQLApi,
			}
		})

		const deadLetterQueue = new Queue(this, 'DeadLetterQueue')

		deviceNamespaceSync.addEventSource(
			new DynamoEventSource(deviceTable, {
				startingPosition: StartingPosition.TRIM_HORIZON,
				batchSize: 1,
				retryAttempts: 3,
				onFailure: new SqsDlq(deadLetterQueue),
			}),
		)
	}
}
