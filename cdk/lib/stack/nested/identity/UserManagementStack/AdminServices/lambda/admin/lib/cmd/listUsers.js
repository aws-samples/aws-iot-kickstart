const AWS = require('aws-sdk')
const { mapUser } = require('../utils')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function listUsers (limit, paginationToken) {
	let params = {
		UserPoolId: process.env.USER_POOL_ID,
		AttributesToGet: [
			'email',
			'nickname',
		],
		Filter: '',
	}

	if (limit) {
		params.Limit = limit
	}

	if (paginationToken) {
		params.PaginationToken = paginationToken
	}

	console.log('listUsers: params:', params)

	const { Users } = await cognito.listUsers(params).promise()

	return {
		Users: Users.map(mapUser),
	}
}

module.exports = {
	listUsers: async function (event, context) {
		return listUsers(event.limit, event.paginationToken)
	},
}
