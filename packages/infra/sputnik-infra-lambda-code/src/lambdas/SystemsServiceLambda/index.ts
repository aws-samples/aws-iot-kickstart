import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	TABLE_DEVICES: string
	TABLE_DEVICE_BLUEPRINTS: string
	TABLE_DEVICE_TYPES: string
	TABLE_SYSTEMS: string
	TABLE_SYSTEM_BLUEPRINTS: string
	TABLE_SETTINGS: string
	}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class SystemsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('systems-service'))
	}

	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'c4a60c30-cfec-11ea-87d0-0242ac130003',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_SystemsServices',
			description: 'Sputnik Systems microservice',
			code: SystemsServiceLambda.codeAsset,
		}) as unknown as TCompiledProps)
	}
}
