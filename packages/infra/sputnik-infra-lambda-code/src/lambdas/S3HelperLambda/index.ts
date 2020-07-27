import { Construct } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Environment extends LambdaEnvironment {
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class S3HelperLambda extends CompiledLambdaFunction<Environment> {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath('s3-helper'))
	}

	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'c4a60906-cfec-11ea-87d0-0242ac130003',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_S3HelperXServices',
			description: 'Sputnik S3HelperX microservice',
			code: S3HelperLambda.codeAsset,
		}) as unknown as TCompiledProps)
	}
}
