const AWS = require('aws-sdk')
const { mapUser } = require('../utils')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function getUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	const userResult = await cognito.adminGetUser(params).promise()

	const { Groups: groups } = await cognito.adminListGroupsForUser(params).promise()

	const user = mapUser(userResult)
	user.groups = groups.map((group) => group.GroupName)

	return user
}

module.exports = {
	getUser: async function (event, context) {
		return getUser(event.username)
	},
}
