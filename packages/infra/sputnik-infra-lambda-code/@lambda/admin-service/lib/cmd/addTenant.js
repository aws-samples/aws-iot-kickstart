const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

async function addTenant (name) {
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

module.exports = {
	addTenant: async function (event) {
		return addTenant(event.name)
	},
}
