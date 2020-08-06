import { setUserGroups } from '../utils'

async function updateUser (username, groups) {
	return setUserGroups(process.env.USER_POOL_ID, username, groups)
}

export async function handler(event) {
		return updateUser(event.username, event.groups)
}

export default handler
