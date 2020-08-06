import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

export async function listGroups (limit, nextToken) {
	let params = {
		UserPoolId: process.env.USER_POOL_ID,
	}

	if (limit) {
		params.Limit = limit
	}

	if (nextToken) {
		params.NextToken = nextToken
	}

	return cognito.listGroups(params).promise()
}

export async function handler(event) {
		return listGroups(event.limit, event.nextToken)
}

export default handler
