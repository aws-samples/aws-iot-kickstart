import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import {
	Effect,
	PolicyStatement,
} from '@aws-cdk/aws-iam'
import {
	CognitoIDP as CognitoIDPActions,
} from 'cdk-iam-actions/lib/actions'
import { CLAIM_PREFIX, INTERNAL_GROUPS, INTERNAL_TENANT, DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	CLAIM_PREFIX: string
	INTERNAL_TENANT: string
	INTERNAL_NAMESPACE: string
	INTERNAL_GROUPS: string
}

type TCompiledProps = CompiledLambdaProps<Environment>

export class CognitoPreTokenGenerationLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string) {
		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'CognitoPreTokenGeneration'),
			description: 'Sputnik cognito pretoken generation handler',
			code: Code.fromAsset(lambdaPath('cognito-pre-token-generation')),
			environment: {
				CLAIM_PREFIX,
				INTERNAL_TENANT,
				INTERNAL_NAMESPACE: DEFAULT_NAMESPACE,
				INTERNAL_GROUPS: INTERNAL_GROUPS.join(','),
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						CognitoIDPActions.ADMIN_GET_USER,
						CognitoIDPActions.ADMIN_LIST_GROUPS_FOR_USER,
					],
					resources: [
						// TODO: [SECURITY] scope this permission
						'*',
					],
				}),
			]
		}

		super(scope, id, compiledProps)
	}
}
