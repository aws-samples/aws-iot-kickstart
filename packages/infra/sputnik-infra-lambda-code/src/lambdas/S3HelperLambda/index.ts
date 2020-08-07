import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import {
	Effect,
	PolicyStatement,
} from '@aws-cdk/aws-iam'
import * as actions from 'cdk-iam-actions/lib/actions'
import { IBucket } from '@aws-cdk/aws-s3'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Environment extends LambdaEnvironment {
}

interface Dependencies {
	readonly destBucket: IBucket
	readonly dataBucket: IBucket

	readonly settingTable: ITable
	readonly deviceTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly deviceTypeTable: ITable
	readonly systemTable: ITable
	readonly systemBlueprintTable: ITable
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class S3HelperLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('s3-helper'))
	}


	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const {
			deviceTable, deviceTypeTable, deviceBlueprintTable,
			settingTable, systemTable, systemBlueprintTable,
			destBucket, dataBucket,
		} = props.dependencies

		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'S3Helper'),
			description: 'Sputnik S3 Custom Resource Lambda Function Helper',
			code: S3HelperLambda.codeAsset,
			environment: {},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						// TODO: [SECURITY] Too permissive, lock these down to just what deployment needs
						's3:*',
						actions.KMS.DECRYPT,
						actions.KMS.DESCRIBE_KEY
					],
					resources: [
						destBucket.arnForObjects('*'),
						dataBucket.arnForObjects('*'),
					]
				}),
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
				// TODO: check lambda if these are needed, from old yml template shared permissions with helper utils
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
