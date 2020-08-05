export const commands = {
	...require('./addTenant'),
	...require('./deleteUser'),
	...require('./disableUser'),
	...require('./enableUser'),
	...require('./getUser'),
	...require('./inviteUser'),
	...require('./listGroups'),
	...require('./listTenants'),
	...require('./listUsers'),
	...require('./updateUser'),
}

export const commandNames = Object.keys(commands)
