import * as api from '../api'
import config from '../config'

const AWS = require('aws-sdk')

export async function handler (event) {
	console.log('Recieved Event:', JSON.stringify(event, null, 2))

	await Promise.all(event.Records.map(handleRecord))

	console.info(`Successfully processed ${event.Records.length} records`)
}

export async function handleRecord (record) {
	console.log('Record: ', JSON.stringify(record, null, 2))
	const { eventID, eventName, dynamodb } = record

	console.log(`Start processing event: ${eventID}`)

	try {
		const newImage = AWS.DynamoDB.Converter.unmarshall(dynamodb.NewImage)
		const oldImage = AWS.DynamoDB.Converter.unmarshall(dynamodb.OldImage)

		console.log('newImage: ', JSON.stringify(newImage))
		console.log('oldImage: ', JSON.stringify(oldImage))

		switch (eventName) {
			case 'INSERT':
				console.log('The thing has been just created. No namespace change required, it will be configured upon deployment')
				break
			case 'MODIFY': {
				console.log('The thing has been updated...')

				const newNamespace = newImage.namespace || config.defaultNamespace
				const oldNamespace = oldImage.namespace || config.defaultNamespace

				if (newNamespace !== oldNamespace) {
					console.log('Namespace change detected...')

					// if we had a previous deployment and certificates are set means the device is able to send/receive messages
					if (newImage.lastDeploymentId !== 'UNKNOWN' && newImage.certificateArn !== 'NOTSET') {
						console.log(`Sending command to update namespace with: ${newNamespace}`)

						const result = await api.publishNamespace(newImage.thingName, newNamespace)
						console.log('Publish result: ', JSON.stringify(result))

						// if the new namespace is the default one, will not performed deployment to prevent loosing events
						// if the new namespace is not default we can force the deployment to update the bp configuration in the device
						if (newNamespace !== config.defaultNamespace) {
							console.log('Namespace change not to "default" one. Triggering deployment to align bp configuration')

							await api.deploy(newImage.thingId)
						}
					} else {
						console.log('Device has never been configured. Namespace alignment and configuration will be sent upon first deployment')
					}
				} else {
					console.log('No namespace changes detected')
				}

				break
			}
			case 'REMOVE': {
				console.log('The thing has been removed. Restoring the namespace to default')

				// if we had a previous deployment and certificates are set means the device is able to send/receive messages
				if (newImage.lastDeploymentId !== 'UNKNOWN' && newImage.certificateArn !== 'NOTSET') {
					console.log(`Sending command to update namespcae with: ${config.defaultNamespace}`)

					const result = await api.publishNamespace(oldImage.thingName, config.defaultNamespace)

					console.log('Publish result: ', JSON.stringify(result))
				} else {
					console.log('Device has never been configured. Namespace alignment and configuration will be sent upon first deployment')
				}

				break
			}
			default:
				console.log(`Unsupported event name '${eventName}'`)
		}
	} catch (err) {
		console.error('Unexpected exception')
		console.error(err)
	}
	console.log(`End processing event: ${eventID}`)
}
