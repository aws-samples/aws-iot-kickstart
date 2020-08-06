import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

const INTERNAL_TENANT = process.env.INTERNAL_TENANT
const INTERNAL_GROUPS = process.env.INTERNAL_GROUPS.split(',')

export async function listTenants () {
	let params = {
		UserPoolId: process.env.USER_POOL_ID,
		Limit: 60,
	}

	const groupNames = []

	// Get all groups in single call rather than paginated for tenant list use case
	let result
	do {
		result = await cognito.listGroups(params).promise()
		groupNames.push(...result.Groups.map((group) => group.GroupName))
		params.NextToken = result.NextToken
	} while (result.NextToken)

	return [INTERNAL_TENANT].concat(groupNames.filter((groupName) => !INTERNAL_GROUPS.includes(groupName)))
}

export async function handler(event) {
		return listTenants()
}

export default handler
