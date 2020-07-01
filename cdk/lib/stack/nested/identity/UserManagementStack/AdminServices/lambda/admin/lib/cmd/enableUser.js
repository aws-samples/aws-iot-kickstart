const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function enableUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminEnableUser(params).promise()
}

module.exports = {
	enableUser: async function (event, context) {
		return enableUser(event.username)
	},
}
