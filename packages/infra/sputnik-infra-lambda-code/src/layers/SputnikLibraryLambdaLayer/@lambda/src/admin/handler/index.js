import { commands, commandNames } from '../command'

export async function handler (event) {
	console.log('Event:', JSON.stringify(event, null, 2))
	console.log('Commands:', commandNames.join(','))

	if (commandNames.includes(event.cmd)) {
		return commands[event.cmd](event)
	} else {
		throw new Error(`Unknown cmd "${event.cmd}" - Must be one of [${commandNames.join(',')}]`)
	}
}
