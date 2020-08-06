import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognitoISP = new CognitoIdentityServiceProvider()

export async function getUser (username, userPoolId) {
	const params = {
		UserPoolId: userPoolId,
		Username: username,
	}

	const user = await cognitoISP.adminGetUser(params).promise()
	const { Groups: groups } = await cognitoISP.adminListGroupsForUser(params).promise()

	const sortedGroupNames = groups.map((group) => group.GroupName).sort((a, b) => {
		// @ts-ignore
		if (a.Precedence < b.Precedence) {
			return -1
		}

		// @ts-ignore
		if (a.Precedence > b.Precedence) {
			return 1
		}

		return 0
	})

	return {
		...user.UserAttributes.reduce((attributes, attr) => {
			return {
				...attributes,
				[attr.Name]: attr.Value,
			}
		}, {}),
		// @ts-ignore
		creationDate: user.CreationDate,
		enabled: user.Enabled,
		groups: sortedGroupNames,
		group: sortedGroupNames[0],
	}
}
