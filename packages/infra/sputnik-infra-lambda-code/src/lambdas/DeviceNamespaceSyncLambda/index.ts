import { Construct } from '@aws-cdk/core'
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { Code } from '@aws-cdk/aws-lambda'
import { GraphQLApi } from '@aws-cdk/aws-appsync'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { CompiledLambdaFunction, CompiledLambdaProps, ExposedLambdaProps, LambdaEnvironment, lambdaPath } from '../../CompiledLambdaFunction'

interface Environment extends LambdaEnvironment {
	GRAPHQL_ENDPOINT: string
	DEFAULT_NAMESPACE: string
}

interface Dependencies {
	readonly graphQLApi: GraphQLApi
}

type TCompiledProps = CompiledLambdaProps<Environment>
type TLambdaProps = ExposedLambdaProps<Dependencies>

export class DeviceNamespaceSyncLambda extends CompiledLambdaFunction<Environment> {
	constructor (scope: Construct, id: string, props: TLambdaProps) {
		const { graphQLApi } = props.dependencies

		const compiledProps: TCompiledProps = {
			// TODO: name this namespace, but that lives in infra which reference this package so would be circular dep
			functionName: namespaced(scope, 'DeviceNamespaceSync'),
			description: 'Sputnik device namespace sync',
			code: Code.fromAsset(lambdaPath('device-namespace-sync')),
			environment: {
				GRAPHQL_ENDPOINT: graphQLApi.graphQlUrl,
				DEFAULT_NAMESPACE,
			},
			initialPolicy: [
				new PolicyStatement({
						actions: ['appsync:GraphQL'],
						resources: [
							graphQLApi.arn + '/types/Mutation/fields/addDeployment',
						],
						effect: Effect.ALLOW,
					}),
					new PolicyStatement({
						actions: ['iot:Connect', 'iot:Publish', 'iot:DescribeEndpoint'],
						resources: ['*'],
						effect: Effect.ALLOW,
					}),
			]
		}

		super(scope, id, compiledProps)
	}
}
