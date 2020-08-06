import { IUserPool } from '@aws-cdk/aws-cognito'
import { Construct, NestedStack, NestedStackProps } from '@aws-cdk/core'
import * as path from 'path'
import { GRAPHQL_SCHEMA_PATH } from '@deathstar/sputnik-core-api/lib/schema-file'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import { ExtendableRestApi } from '@deathstar/sputnik-infra-core/lib/construct/api/rest/ExtendableRestApi'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'

export interface ApiStackProps extends NestedStackProps {
	readonly userPool: IUserPool
}

export class ApiStack extends NestedStack {
	readonly graphQLApi: ExtendableGraphQLApi

	readonly restApi: ExtendableRestApi

	constructor (scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props)

		const { userPool } = props

		this.graphQLApi = new ExtendableGraphQLApi(this, 'GraphQLApi', {
			name: namespaced(this, 'GraphQL-Api'),
			schemaDefinitionFile: GRAPHQL_SCHEMA_PATH,
			userPool,
		})

		this.restApi = new ExtendableRestApi(this, 'RestApi', {
			restApiName: namespaced(this, 'Rest-Api'),
		})
	}
}
