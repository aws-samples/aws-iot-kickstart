import { addDeployment, CMD_ADD_DEPLOYMENT } from '../command/add-deployment'

export * from './environment'

export async function handler (event) {
	console.log('Event:', JSON.stringify(event, null, 2))

	const { cmd } = event

	switch (cmd) {
		case CMD_ADD_DEPLOYMENT:
			return addDeployment(event)
		default:
			throw new Error(`Unknown cmd: ${cmd}`)
	}
}
