const AWS = require('aws-sdk')
const { setUserGroups } = require('../utils')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function inviteUser (name, email, groups) {
	console.log('inviteUser:', name, email, groups)

	const username = email

	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
		DesiredDeliveryMediums: ['EMAIL'],
		ForceAliasCreation: true,
		UserAttributes: [
			{
				Name: 'email',
				Value: email,
			}, {
				Name: 'email_verified',
				Value: 'true',
			}, {
				Name: 'nickname',
				Value: name,
			},
		],
	}

	const user = await cognito.adminCreateUser(params).promise()

	console.log('User successfully invited:', user)

	if (groups && groups.length > 0) {
		await setUserGroups(process.env.USER_POOL_ID, username, groups)

		console.log('User successfully added to groups:', username, groups)
	}

	return true
}

module.exports = {
	inviteUser: async function (event) {
		return inviteUser(event.name, event.email, event.groups)
	},
}
