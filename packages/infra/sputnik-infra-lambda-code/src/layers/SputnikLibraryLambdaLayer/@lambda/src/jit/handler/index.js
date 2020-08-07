import * as AWS from 'aws-sdk'
import * as moment from 'moment'
import * as shortid from 'shortid'
import { addDevice } from '../../device/command/addDevice'
import { addDeployment } from '../../deployment/command/add-deployment'

const documentClient = new AWS.DynamoDB.DocumentClient()
const iot = new AWS.Iot()

const lib = 'justInTimeOnBoarding'


export function handler (event, context, callback) {
	const tag = `${lib}(${event.clientId}):`
	console.log(tag, 'Event:', JSON.stringify(event, null, 2))

	// Get the certificate for the principal
	let _cert
	// let _thingName;
	let _device

	let _sputnikAutodeploy = false

	// Filter out iotconsole events
	if (event.topic.includes('iotconsole')) {
		console.log('IoTConsole: ignoring iotconsole console event', event.topic)
		callback(null, null)

		return
	}

	console.log(tag, 'First describe the certificate for the incoming principal.')
	iot.describeCertificate({
		certificateId: event.principalIdentifier,
	})
		.promise()
		.catch(err => {
			if (err.code === 'ResourceNotFoundException') {
				console.log(tag, 'Sputnik does not support Just In Time Registration for now.')
				err.code = 'NoFail'
			}
			throw err
		})
		.then(cert => {
			_cert = cert
			// @ts-ignore
			console.log(tag, 'Found certificate:', _cert.certificateArn)

			return iot
				.listPrincipalThings({
					principal: _cert.certificateDescription.certificateArn,
					maxResults: 1,
				})
				.promise()
				.then(data => {
					if (data.things.length === 0) {
						const newThingName = `sputnik-${shortid.generate()}`
						console.log(
							tag,
							'Cert is not attached to any thing. Create Sputnik Device with ThingName:',
							newThingName
						)

						return addDevice({
							deviceTypeId: 'UNKNOWN',
							deviceBlueprintId: 'UNKNOWN',
							thingName: newThingName,
							name: newThingName,
						}).then(r => {
							return iot
								.describeThing({
									thingName: newThingName,
								})
								.promise()
						})
					} else {
						console.log(tag, 'Cert is attached to thing:', data.things[0])

						return iot
							.describeThing({
								thingName: data.things[0],
							})
							.promise()
					}
				})
		})
		.then(thing => {
			console.log(tag, 'Found thing:', thing)

			const attributes = thing.attributes

			if (attributes.iot_certificate_arn === _cert.certificateArn) {
				return thing
			} else {
				attributes.iot_certificate_arn = _cert.certificateArn
				console.log(tag, 'Updating the attributes:', attributes)

				return iot
					.updateThing({
						thingName: thing.thingName,
						attributePayload: {
							attributes: attributes,
							merge: true,
						},
					})
					.promise()
					.then(() => {
						return iot
							.describeThing({
								thingName: thing.thingName,
							})
							.promise()
					})
			}
		})
		.then(thing => {
			console.log(tag, 'Fetch Sputnik Device.')

			return documentClient
				.get({
					TableName: process.env.TABLE_DEVICES,
					Key: {
						thingId: thing.thingId,
					},
				})
				.promise()
				// @ts-ignore
				.then(device => {
					if (!device.Item) {
						console.log(tag, 'Device does not exist. Create it.')

						const { deviceTypeId, deviceBlueprintId, greengrassGroupId, sputnikAutodeploy } = thing.attributes

						return addDevice({
							deviceTypeId: deviceTypeId || 'UNKNOWN',
							deviceBlueprintId: deviceBlueprintId || 'UNKNOWN',
							greengrassGroupId: greengrassGroupId || 'UNKNOWN',
							thingName: thing.thingName,
							name: thing.thingName,
							thing,
						}).then(r => {
							// Only allow auto deploy when creating new device with defined blueprint
							if (deviceTypeId && deviceBlueprintId) {
								_sputnikAutodeploy = String(sputnikAutodeploy) === 'true'
							}

							return {
								Item: r,
							}
						})
					} else {
						return device
					}
				})
		})
		.then(device => {
			_device = device.Item

			console.log(tag, 'Device:', _device)

			let newMomentTimestamp = moment(event.timestamp)
			let connectionState = {
				state: event.eventType,
				at: newMomentTimestamp.utc().format(),
			}
			let updateParams = {
				TableName: process.env.TABLE_DEVICES,
				Key: {
					thingId: _device.thingId,
				},
				UpdateExpression: 'set #ua = :ua, #certArn = :certArn, #cS = :cS',
				ExpressionAttributeNames: {
					'#ua': 'updatedAt',
					'#certArn': 'certificateArn',
					'#cS': 'connectionState',
				},
				ExpressionAttributeValues: {
					':ua': moment()
						.utc()
						.format(),
					':certArn': _cert.certificateDescription.certificateArn,
					':cS': connectionState,
				},
			}

			console.log(tag, 'Check if the event timestamp is after existing one')

			if (_device && _device.hasOwnProperty('connectionState') && _device.connectionState.hasOwnProperty('at')) {
				let oldMomentTimestamp = moment(_device.connectionState.at)

				if (oldMomentTimestamp.isAfter(newMomentTimestamp)) {
					console.log(tag, 'Skip update because MQTT messages are swapped')
					console.log(tag, 'oldMomentTimestamp:', oldMomentTimestamp.utc().format())
					console.log(tag, 'newMomentTimestamp:', newMomentTimestamp.utc().format())

					return _device
				}
			}

			return documentClient.update(updateParams).promise().then(() => _device)
		})
		.then(device => {
			if (_sputnikAutodeploy) {
				console.log('AutoDeploy: adding deployment')

				return addDeployment(device.thingId).then(() => {
					console.log('AutoDeploy: adding deployment')

					return device
				})
			} else {
				console.log('AutoDeploy not enabled')

				return device
			}
		})
		.then((device) => callback(null, null))
		.catch(err => {
			console.log(tag, 'Error:', err, err.stack)

			if (err.code === 'NoFail') {
				callback(null, null)
			} else {
				callback(err, null)
			}
		})
}
