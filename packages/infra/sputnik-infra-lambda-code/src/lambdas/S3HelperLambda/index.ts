import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// TODO: refactor sputnik-infra/src/stack/nested/existing/SputnikStack/cf/lambda-helpers.yml to use this completely
// currently just gets code asset path

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Environment extends LambdaEnvironment {
}

export class S3HelperLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('s3-helper'))
	}
}
