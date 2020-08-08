
const AWS = require('aws-sdk')
const { where } = require('underscore')

const cognito = new AWS.CognitoIdentityServiceProvider()

function getAttribute (attributes, name, defaultValue) {
	const attr = where(attributes, { Name: name })

	if (attr.length > 0) {
		return attr[0].Value
	}

	return defaultValue
}

function mapUser ({ Username, Attributes, UserAttributes, Enabled, UserCreateDate, UserLastModifiedDate }) {
	return {
		user_id: Username,
		name: getAttribute(Attributes || UserAttributes, 'nickname', ''),
		email: getAttribute(Attributes || UserAttributes, 'email', ''),
		groups: [],
		enabled: Enabled,
		created_at: UserCreateDate,
		updated_at: UserLastModifiedDate,
	}
}

async function setUserGroups (poolinfo, username, groups) {
	return Promise.all(groups.map(group => {
		const params = {
			GroupName: group.name,
			UserPoolId: poolinfo,
			Username: username,
		}

		if (group._state === 'new') {
			return cognito.adminAddUserToGroup(params).promise()
		} else if (group._state === 'deleted') {
			return cognito.adminRemoveUserFromGroup(params).promise()
		} else {
			return null
		}
	})).then(results => {
		return 'group modifications complete'
	})
}

module.exports = {
	mapUser,
	setUserGroups,
}
