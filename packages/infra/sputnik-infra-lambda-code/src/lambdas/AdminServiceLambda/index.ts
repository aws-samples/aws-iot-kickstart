import { Construct } from '@aws-cdk/core'
import { Code } from '@aws-cdk/aws-lambda'
import {
	Effect,
	PolicyStatement,
	IRole,
} from '@aws-cdk/aws-iam'
import {
	IAM as IAMActions,
} from 'cdk-iam-actions/lib/actions'
import { IUserPool } from '@aws-cdk/aws-cognito'
import { INTERNAL_GROUPS, INTERNAL_TENANT } from '@deathstar/sputnik-core'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { CompiledLambdaFunction, CompiledLambdaProps, DependencyProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	USER_POOL_ID: string
	TENANT_ROLE_ARN: string
	INTERNAL_TENANT: string
	INTERNAL_GROUPS: string
}

interface Dependencies {
	readonly userPool: IUserPool
	readonly tenantRole: IRole
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class AdminServiceLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const { tenantRole, userPool } = props.dependencies

		const compiledProps: TCompiledProps = {
			functionName: namespaced(scope, 'AdminServices'),
			description: 'Sputnik Admin microservice',
			code: Code.fromAsset(lambdaPath('admin-service')),
			environment: {
				USER_POOL_ID: userPool.userPoolId,
				TENANT_ROLE_ARN: tenantRole.roleArn,
				INTERNAL_TENANT,
				INTERNAL_GROUPS: INTERNAL_GROUPS.join(','),
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						// TODO: [SECURITY] Too permissive for now.
						'cognito-idp:*',
						// 'cognito-idp:ListUsers',
						// 'cognito-idp:AdminEnableUser',
						// 'cognito-idp:AdminDisableUser',
						// 'cognito-idp:AdminDeleteUser',
						// 'cognito-idp:AdminAddUserToGroup',
					],
					resources: ['*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						// TODO: Move this to "Admin" only role... not created yet
						IAMActions.PASS_ROLE,
					],
					// TODO: [SECURITY] Too permissive for now.
					resources: [tenantRole.roleArn],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						// TODO: [SECURITY] Too permissive for now.
						'iot:*',
						'greengrass:*',
					],
					resources: ['*'],
				}),
			]
		}

		super(scope, id, compiledProps)
	}
}
