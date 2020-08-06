import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-services.yml to use this completely
// currently just gets code asset path

interface Environment extends LambdaEnvironment {
	TABLE_DEVICES: string
	TABLE_DEVICE_BLUEPRINTS: string
	TABLE_DEVICE_TYPES: string
	TABLE_SYSTEMS: string
	TABLE_SYSTEM_BLUEPRINTS: string
	TABLE_SETTINGS: string
	}

export class SystemsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('systems-service'))
	}
}
