import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-services.yml to
// be full cdk and use this, currently just gets the asset path

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

export class JITOnboardingServiceLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('jit-onboarding-service'))
	}
}
