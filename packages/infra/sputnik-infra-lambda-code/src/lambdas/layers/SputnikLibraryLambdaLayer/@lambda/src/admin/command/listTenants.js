const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

const INTERNAL_TENANT = process.env.INTERNAL_TENANT
const INTERNAL_GROUPS = process.env.INTERNAL_GROUPS.split(',')

async function listTenants () {
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

module.exports = {
	listTenants: async function (event) {
		// @ts-ignore
		return listTenants(event.limit, event.nextToken)
	},
}
