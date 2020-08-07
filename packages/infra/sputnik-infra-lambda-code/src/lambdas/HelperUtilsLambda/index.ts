import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import {
	Effect,
	PolicyStatement,
	IRole,
} from '@aws-cdk/aws-iam'
import * as actions from 'cdk-iam-actions/lib/actions'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	TABLE_DEVICES: string
	TABLE_DEVICE_BLUEPRINTS: string
	TABLE_DEVICE_TYPES: string
	TABLE_SYSTEMS: string
	TABLE_SYSTEM_BLUEPRINTS: string
	TABLE_SETTINGS: string
	GREENGRASS_SERVICE_ROLE_ARN: string
}

interface Dependencies {
	readonly deviceTable: ITable
	readonly deviceTypeTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly systemTable: ITable
	readonly systemBlueprintTable: ITable
	readonly settingTable: ITable
	readonly greengrassServiceRole: IRole
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class HelperUtilsLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('helper-utils'))
	}

	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const { deviceTable, deviceTypeTable, deviceBlueprintTable, settingTable, systemBlueprintTable, systemTable, greengrassServiceRole } = props.dependencies

		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'HelperUtils'),
			description: 'Sputnik Helper Utils microservice',
			code: HelperUtilsLambda.codeAsset,
			environment: {
				TABLE_DEVICES: deviceTable.tableName,
				TABLE_DEVICE_BLUEPRINTS: deviceBlueprintTable.tableName,
				TABLE_DEVICE_TYPES: deviceTypeTable.tableName,
				TABLE_SYSTEMS: systemTable.tableName,
				TABLE_SYSTEM_BLUEPRINTS: systemBlueprintTable.tableName,
				TABLE_SETTINGS: settingTable.tableName,
				GREENGRASS_SERVICE_ROLE_ARN: greengrassServiceRole.roleArn,
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
						systemTable.tableArn,
						systemBlueprintTable.tableArn,
					]
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.IAM.PASS_ROLE,
						actions.IoT.DESCRIBE_ENDPOINT,
						actions.IoT.ATTACH_PRINCIPAL_POLICY,
						actions.IoT.GET_THING_SHADOW,
						actions.IoT.UPDATE_THING_SHADOW,
						actions.IoT.PUBLISH,
						actions.IoT.DELETE_THING_SHADOW,
						actions.Greengrass.ASSOCIATE_SERVICE_ROLE_TO_ACCOUNT,
					],
					// TODO: [SECURITY] Too permissive, lock these down to just what deployment needs
					resources: [
						'*',
					]
				}),
			]
		}

		super(scope, id, compiledProps)
	}
}
