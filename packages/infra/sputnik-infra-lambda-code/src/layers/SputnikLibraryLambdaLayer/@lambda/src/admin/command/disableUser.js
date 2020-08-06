import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

export async function disableUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminDisableUser(params).promise()
}

export async function handler(event) {
		return disableUser(event.username)
}

export default handler
