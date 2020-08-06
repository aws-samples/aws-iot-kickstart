import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-services.yml to use this completely
// currently just gets code asset path

interface Environment extends LambdaEnvironment {
	IOT_JUST_IN_TIME_ON_BOARDING_TOPIC_RULE: string
}

export class SettingsServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('settings-service'))
	}
}
