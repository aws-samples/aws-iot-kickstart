import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

export async function deleteUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	return cognito.adminDeleteUser(params).promise().then(data => {
		return data
	})
}

export async function handler(event) {
		return deleteUser(event.username)
}

export default handler
