import { IUserPool } from '@aws-cdk/aws-cognito'
import { Construct, NestedStack, NestedStackProps } from '@aws-cdk/core'
import * as path from 'path'
import { ExtendableGraphQLApi } from '../../../../construct/api/graphql/ExtendableGraphQLApi'
import { ExtendableRestApi } from '../../../../construct/api/rest/ExtendableRestApi'
import { namespaced } from '../../../../utils/cdk-identity-utils'

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
			schemaDefinitionFile: path.join(__dirname, 'schema.api.graphql'),
			userPool,
			schemaConfig: {
				Query: { directives: '@aws_iam @aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])' },
				Mutation: { directives: '@aws_iam @aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])' },
				Subscription: { directives: '@aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])' },
			},
		})

		this.restApi = new ExtendableRestApi(this, 'RestApi', {
			restApiName: namespaced(this, 'Rest-Api'),
		})
	}
}
