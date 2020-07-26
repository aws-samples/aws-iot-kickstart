const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function listGroups (limit, nextToken) {
	let params = {
		UserPoolId: process.env.USER_POOL_ID,
	}

	if (limit) {
		params.Limit = limit
	}

	if (nextToken) {
		params.NextToken = nextToken
	}

	return cognito.listGroups(params).promise()
}

module.exports = {
	listGroups: async function (event) {
		return listGroups(event.limit, event.nextToken)
	},
}
