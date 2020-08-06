import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider()

export async function addTenant (name) {
	let params = {
		UserPoolId: process.env.USER_POOL_ID,
		RoleArn: process.env.TENANT_ROLE_ARN,
		GroupName: name,
		Description: `Tenant group ${name}`,
	}

	try {
		const { Group } = await cognito.createGroup(params).promise()

		console.log('Created new tenant group', Group)

		return {
			tenant: name,
			group: Group,
		}
	} catch (error) {
		console.error('Failed to create tenant', params, error)

		throw error
	}
}

export async function handler(event) {
		return addTenant(event.name)
}

export default handler
