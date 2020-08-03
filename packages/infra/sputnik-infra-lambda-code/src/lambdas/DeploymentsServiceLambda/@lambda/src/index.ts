import { addDeployment, ADD_DEPLOYMENT_CMD } from './command/add-deployment'

export async function handler (event) {
	console.log('Event:', JSON.stringify(event, null, 2))

	const { cmd } = event

	switch (cmd) {
		case ADD_DEPLOYMENT_CMD:
			return addDeployment(event)
		default:
			throw new Error(`Unknown cmd: ${cmd}`)
	}
}
