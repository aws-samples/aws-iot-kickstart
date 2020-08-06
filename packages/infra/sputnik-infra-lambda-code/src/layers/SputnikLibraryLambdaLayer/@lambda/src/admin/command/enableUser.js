import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

export async function enableUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminEnableUser(params).promise()
}

export async function handler(event) {
		return enableUser(event.username)
}

export default handler
