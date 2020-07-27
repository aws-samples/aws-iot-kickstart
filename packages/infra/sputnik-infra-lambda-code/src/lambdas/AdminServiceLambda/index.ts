import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	USER_POOL_ID: string
	TENANT_ROLE_ARN: string
	INTERNAL_TENANT: string
	INTERNAL_GROUPS: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class AdminServiceLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'a91debe6-cfdc-11ea-87d0-0242ac130003',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_AdminServices',
			description: 'Sputnik Admin microservice',
			code: Code.fromAsset(lambdaPath('admin-service')),
		}) as unknown as TCompiledProps)
	}
}
