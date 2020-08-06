import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { IRole } from '@aws-cdk/aws-iam'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-helpers.yml to use this completely
// currently just gets code asset path

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

	// TODO: private until refactored
	private constructor (scope: Construct, id: string, props: TLambdaProps) {
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
			// TODO: add initial policy from cf yaml
		}

		super(scope, id, compiledProps)
	}
}
