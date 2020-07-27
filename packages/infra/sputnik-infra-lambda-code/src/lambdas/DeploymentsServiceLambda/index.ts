import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

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

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class DeploymentsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('deployments-service'))
	}

	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'b7fd16c2-4397-4b19-8626-196fb37e5770',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_DeploymentsServices',
			description: 'Sputnik Deployments microservice',
			code: DeploymentsServiceLambda.codeAsset,
		}) as unknown as TCompiledProps)
	}
}
