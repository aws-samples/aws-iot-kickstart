import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { IRole } from '@aws-cdk/aws-iam'
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
	readonly deviceTable: ITable
	readonly deviceTypeTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly deploymentTable: ITable
	readonly settingTable: ITable
	readonly greengrassGroupsIAMRole: IRole
	readonly iotPolicyForGreengrassCores: CfnIotPolicy
	readonly dataBucket: IBucket
	readonly iotEndpoint: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-services.yml to
// be full cdk and use this, currently just gets the asset path

export class DeploymentsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('deployments-service'))
	}

	// TODO: private until refactored
	private constructor (scope: Construct, id: string, props: TLambdaProps) {
		const {
			deviceTable, deviceTypeTable, deviceBlueprintTable, deploymentTable, settingTable,
			greengrassGroupsIAMRole, iotPolicyForGreengrassCores,
			dataBucket, iotEndpoint,
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
				IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: greengrassGroupsIAMRole.roleArn,
				IOT_POLICY_GREENGRASS_CORE: iotPolicyForGreengrassCores.ref,
				DATA_BUCKET: dataBucket.bucketName,
				IOT_ENDPOINT: iotEndpoint,
			},
			// TODO: add initial policy from cf yaml
		}

		super(scope, id, compiledProps)
	}
}
