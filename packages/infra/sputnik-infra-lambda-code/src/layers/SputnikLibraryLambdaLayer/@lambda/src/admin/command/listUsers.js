import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { mapUser } from '../utils'

const cognito = new CognitoIdentityServiceProvider()

export async function listUsers (limit, paginationToken) {
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
		users: Users.map(mapUser),
	}
}

export async function handler(event) {
		return listUsers(event.limit, event.paginationToken)
}

export default handler
