import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Environment extends LambdaEnvironment {
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class XXXXXServiceLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'c4a60d3e-cfec-11ea-87d0-0242ac130003',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_UsageMetrics',
			description: 'Sputnik UsageMetrics',
			code: Code.fromAsset(lambdaPath('metrics-usage')),
		}) as unknown as TCompiledProps)
	}
}
