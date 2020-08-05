const { setUserGroups } = require('../utils')

async function updateUser (username, groups) {
	return setUserGroups(process.env.USER_POOL_ID, username, groups)
}

module.exports = {
	updateUser: async function (event, context) {
		return updateUser(event.username, event.groups)
	},
}
