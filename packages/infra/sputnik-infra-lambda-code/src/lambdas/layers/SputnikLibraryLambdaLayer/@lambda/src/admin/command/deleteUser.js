const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function deleteUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminDeleteUser(params).promise().then(data => {
		return data
	})
}

module.exports = {
	deleteUser: async function handler (event) {
		return deleteUser(event.username)
	},
}
