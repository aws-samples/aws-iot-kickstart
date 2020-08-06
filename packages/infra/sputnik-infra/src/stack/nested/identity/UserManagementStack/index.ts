import { Construct, NestedStack, NestedStackProps } from '@aws-cdk/core'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import { AdminServices } from './AdminServices'
import { UserPool } from '@aws-cdk/aws-cognito'
import { Role } from '@aws-cdk/aws-iam'

export interface UserManagementStackProps extends NestedStackProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly userPool: UserPool
	readonly tenantRole: Role
}

export class UserManagementStack extends NestedStack {
	readonly adminServices: AdminServices

	constructor (scope: Construct, id: string, props: UserManagementStackProps) {
		super(scope, id, props)

		const adminServices = new AdminServices(this, 'AdminServices', {
			...props,
		})

		Object.assign(this, {
			adminServices,
		})
	}
}
