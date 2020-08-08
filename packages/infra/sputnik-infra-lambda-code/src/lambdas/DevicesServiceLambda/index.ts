import { Construct, Stack } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { CfnPolicy as CfnIotPolicy } from '@aws-cdk/aws-iot'
import {
	Effect,
	PolicyStatement,
} from '@aws-cdk/aws-iam'
import {
	DynamoDB as DynamoDBActions,
	IoT as IoTActions,
	Greengrass as GreengrassActions,
} from 'cdk-iam-actions/lib/actions'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	DEFAULT_NAMESPACE: string
	TABLE_DEVICES: string
	TABLE_DEVICE_TYPES: string
	TABLE_SETTINGS: string
	IOT_DEFAULT_CONNECT_POLICY: string
}

interface Dependencies {
	readonly settingTable: ITable
	readonly deviceTable: ITable
	readonly deviceTypeTable: ITable
	readonly iotConnectPolicy: CfnIotPolicy
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class DevicesServiceLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const { settingTable, deviceTable, deviceTypeTable, iotConnectPolicy } = props.dependencies

		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'DevicesServices'),
			description: 'Sputnik Devices microservice',
			code: Code.fromAsset(lambdaPath('devices-service')),
			environment: {
				DEFAULT_NAMESPACE,
				TABLE_DEVICES: deviceTable.tableName,
				TABLE_DEVICE_TYPES: deviceTypeTable.tableName,
				TABLE_SETTINGS: settingTable.tableName,
				IOT_DEFAULT_CONNECT_POLICY: iotConnectPolicy.policyName as string,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						DynamoDBActions.BATCH_GET_ITEM,
						DynamoDBActions.BATCH_WRITE_ITEM,
						DynamoDBActions.DELETE_ITEM,
						DynamoDBActions.GET_ITEM,
						DynamoDBActions.PUT_ITEM,
						DynamoDBActions.QUERY,
						DynamoDBActions.SCAN,
						DynamoDBActions.UPDATE_ITEM,
					],
					resources: [
						Stack.of(scope).formatArn({
							service: 'dynamodb',
							resource: 'table',
							resourceName: settingTable.tableName,
						}),
						Stack.of(scope).formatArn({
							service: 'dynamodb',
							resource: 'table',
							resourceName: deviceTable.tableName,
						}),
						Stack.of(scope).formatArn({
							service: 'dynamodb',
							resource: 'table',
							resourceName: deviceTypeTable.tableName,
						}),
					],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						IoTActions.CREATE_THING,
						IoTActions.DELETE_THING,
						IoTActions.DESCRIBE_THING,
						IoTActions.CREATE_CERTIFICATE_FROM_CSR,
						IoTActions.ATTACH_THING_PRINCIPAL,
						IoTActions.ATTACH_PRINCIPAL_POLICY,
						IoTActions.LIST_THING_PRINCIPALS,
						IoTActions.LIST_PRINCIPAL_POLICIES,
						IoTActions.DETACH_PRINCIPAL_POLICY,
						IoTActions.UPDATE_CERTIFICATE,
						IoTActions.DELETE_CERTIFICATE,
						'iot:*', // TODO: [SECURITY] Remove once verify the above list is adequate
						GreengrassActions.RESET_DEPLOYMENTS,
						GreengrassActions.DELETE_GROUP,
						GreengrassActions.CREATE_GROUP,
						'greengrass:*', // TODO: [SECURITY] Remove once verify the above list is adequate
					],
					resources: ['*'],
				}),
			],
		}

		super(scope, id, compiledProps)
	}
}
