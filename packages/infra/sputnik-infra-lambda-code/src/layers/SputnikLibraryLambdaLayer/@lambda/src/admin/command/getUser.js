import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { mapUser } from '../utils'

const cognito = new CognitoIdentityServiceProvider()

export async function getUser (username) {
	const params = {
		UserPoolId: process.env.USER_POOL_ID,
		Username: username,
	}

	const userResult = await cognito.adminGetUser(params).promise()

	const { Groups: groups } = await cognito.adminListGroupsForUser(params).promise()

	// @ts-ignore
	const user = mapUser(userResult)
	user.groups = groups.map((group) => ({ name: group.GroupName }))

	return user
}

export async function handler(event) {
		return getUser(event.username)
}

export default handler
