import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { where } from 'underscore'

const cognito = new CognitoIdentityServiceProvider()

function getAttribute (attributes, name, defaultValue) {
	const attr = where(attributes, { Name: name })

	if (attr.length > 0) {
		return attr[0].Value
	}

	return defaultValue
}

export function mapUser ({ Username, Attributes, Enabled, UserCreateDate, UserLastModifiedDate }) {
	return {
		user_id: Username,
		name: getAttribute(Attributes, 'nickname', ''),
		email: getAttribute(Attributes, 'email', ''),
		groups: [],
		enabled: Enabled,
		created_at: UserCreateDate,
		updated_at: UserLastModifiedDate,
	}
}

export async function setUserGroups (poolinfo, username, groups) {
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
