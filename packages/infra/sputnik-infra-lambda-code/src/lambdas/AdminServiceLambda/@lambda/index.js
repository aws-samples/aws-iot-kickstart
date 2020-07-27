const commands = {
	...require('./lib/cmd/addTenant'),
	...require('./lib/cmd/deleteUser'),
	...require('./lib/cmd/disableUser'),
	...require('./lib/cmd/enableUser'),
	...require('./lib/cmd/getUser'),
	...require('./lib/cmd/inviteUser'),
	...require('./lib/cmd/listGroups'),
	...require('./lib/cmd/listTenants'),
	...require('./lib/cmd/listUsers'),
	...require('./lib/cmd/updateUser'),
}

const commandNames = Object.keys(commands)

async function handler (event) {
	console.log('Event:', JSON.stringify(event, null, 2))
	console.log('Commands:', commandNames.join(','))

	if (commandNames.includes(event.cmd)) {
		return commands[event.cmd](event)
	} else {
		throw new Error(`Unknown cmd "${event.cmd}" - Must be one of [${commandNames.join(',')}]`)
	}
}

exports.handler = handler
