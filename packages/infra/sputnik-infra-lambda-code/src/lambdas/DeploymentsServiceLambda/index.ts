import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import {
	Effect,
	PolicyStatement,
	IRole,
} from '@aws-cdk/aws-iam'
import * as actions from 'cdk-iam-actions/lib/actions'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { IBucket } from '@aws-cdk/aws-s3'
import { CfnPolicy as CfnIotPolicy } from '@aws-cdk/aws-iot'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	TABLE_DEVICES: string
	TABLE_DEVICE_TYPES: string
	TABLE_DEVICE_BLUEPRINTS: string
	TABLE_DEPLOYMENTS: string
	TABLE_SETTINGS: string
	AWS_ACCOUNT: string
	IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: string
	IOT_POLICY_GREENGRASS_CORE: string
	DATA_BUCKET: string
	IOT_ENDPOINT: string
}

interface Dependencies {
	readonly dataBucket: IBucket
	readonly deviceTable: ITable
	readonly deviceTypeTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly deploymentTable: ITable
	readonly settingTable: ITable
	readonly greengrassGroupsRole: IRole
	readonly iotPolicyForGreengrassCores: CfnIotPolicy
	readonly iotEndpointAddress: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class DeploymentsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('deployments-service'))
	}

	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const {
			deviceTable, deviceTypeTable, deviceBlueprintTable, deploymentTable, settingTable,
			greengrassGroupsRole, iotPolicyForGreengrassCores,
			dataBucket, iotEndpointAddress,
		} = props.dependencies

		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'DeploymentsServices'),
			description: 'Sputnik Deployments microservice',
			code: DeploymentsServiceLambda.codeAsset,
			environment: {
				TABLE_DEVICES: deviceTable.tableName,
				TABLE_DEVICE_TYPES: deviceTypeTable.tableName,
				TABLE_DEVICE_BLUEPRINTS: deviceBlueprintTable.tableName,
				TABLE_DEPLOYMENTS: deploymentTable.tableName,
				TABLE_SETTINGS: settingTable.tableName,
				AWS_ACCOUNT: Stack.of(scope).account,
				IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: greengrassGroupsRole.roleArn,
				IOT_POLICY_GREENGRASS_CORE: iotPolicyForGreengrassCores.ref,
				DATA_BUCKET: dataBucket.bucketName,
				IOT_ENDPOINT: iotEndpointAddress,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.DynamoDB.BATCH_GET_ITEM,
						actions.DynamoDB.BATCH_WRITE_ITEM,
						actions.DynamoDB.DELETE_ITEM,
						actions.DynamoDB.GET_ITEM,
						actions.DynamoDB.PUT_ITEM,
						actions.DynamoDB.QUERY,
						actions.DynamoDB.SCAN,
						actions.DynamoDB.UPDATE_ITEM,
					],
					resources: [
						settingTable.tableArn,
						deviceTable.tableArn,
						deviceTypeTable.tableArn,
						deviceBlueprintTable.tableArn,
						deploymentTable.tableArn,
					],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.IAM.PASS_ROLE,
					],
					resources: [
						greengrassGroupsRole.roleArn,
					],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					// TODO: [SECURITY] Too permissive, lock these down to just what deployment needs
					actions: [
						'iot:*',
						'greengrass:*',
					],
					resources: [
						'*',
					],
				}),
			],
		}

		super(scope, id, compiledProps)
	}
}
