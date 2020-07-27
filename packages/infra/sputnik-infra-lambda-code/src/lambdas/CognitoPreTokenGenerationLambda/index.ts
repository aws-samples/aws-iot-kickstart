import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import { CompiledLambdaFunction, CompiledLambdaProps, LambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	CLAIM_PREFIX: string
	INTERNAL_TENANT: string
	INTERNAL_NAMESPACE: string
	INTERNAL_GROUPS: string
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = LambdaProps<Environment>

export class CognitoPreTokenGenerationLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		super(scope, id, Object.assign({}, props, {
			uuid: 'c76914e1-80e8-4569-9e8f-897863620eb9',
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: 'Sputnik_CognitoPreTokenGeneration',
			description: 'Sputnik cognito pretoken generation handler',
			code: Code.fromAsset(lambdaPath('cognito-pre-token-generation')),
		}) as unknown as TCompiledProps)
	}
}
