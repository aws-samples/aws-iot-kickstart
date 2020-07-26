const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function disableUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminDisableUser(params).promise()
}

module.exports = {
	disableUser: async function (event, context) {
		return disableUser(event.username)
	},
}
