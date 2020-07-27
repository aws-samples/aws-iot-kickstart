import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	GRAPHQL_ENDPOINT: string
	DEFAULT_NAMESPACE: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class DeviceNamespaceSyncLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'b0d2f8a4-aba5-4632-994d-87b2a5bfa27b',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_DeviceNamespaceSync',
			description: 'Sputnik device namespace sync',
			code: Code.fromAsset(lambdaPath('device-namespace-sync')),
		}) as unknown as TCompiledProps)
	}
}
