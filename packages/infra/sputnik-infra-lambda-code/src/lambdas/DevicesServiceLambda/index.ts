import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	DEFAULT_NAMESPACE: string
	TABLE_DEVICES: string
	TABLE_DEVICE_TYPES: string
	TABLE_SETTINGS: string
	IOT_DEFAULT_CONNECT_POLICY: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class DevicesServiceLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'c4a6024e-cfec-11ea-87d0-0242ac130003',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_DevicesServices',
			description: 'Sputnik Devices microservice',
			code: Code.fromAsset(lambdaPath('devices-service')),
		}) as unknown as TCompiledProps)
	}
}
