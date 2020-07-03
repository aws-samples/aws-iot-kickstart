const ModbusRTU = require('modbus-serial').default
const reader = require('./src/reader').default
const util = require('./src/utils').default
const config = require('./src/config').default
const ggSdk = require('aws-greengrass-core-sdk')

const iotClient = new ggSdk.IotData()
const SECONDS_IN_A_MINUTE = 60
const { blueprint } = config

const getGeo = () => {
	// mock geospacial coordinates
	// for the real gateway this information should come from a GPS sensor
	return util.generateRandomPoint({
		longitude: 103.731753,
		latitude: 1.372398,
	}, 10)
}

const run = async (client) => {
	while (true) {
		await util.sleep((blueprint.interval || config.defaultInterval) * 1000)

		try {
			const data = await util.getShadownAsync(iotClient, config.thingName)
			const shadow = JSON.parse(data.Payload)

			if (shadow && shadow.state && shadow.state.reported) {
				const { namespace } = shadow.state.reported

				blueprint.namespace = namespace || config.namespace
			} else {
				blueprint.namespace = config.namespace
			}
		} catch (err) {
			console.warn(`Can't get namespace from shadow, will use bp default. ${err.message}`)
		}

		try {
			const holdings = await reader(
				blueprint.holdingRegisters,
				client,
				'readHoldingRegisters',
			)
			const inputs = await reader(
				blueprint.inputRegisters,
				client,
				'readInputRegisters',
			)
			const coils = await reader(blueprint.coils, client, 'readCoils')
			const discrete = await reader(
				blueprint.discreteInputs,
				client,
				'readDiscreteInputs',
			)

			const timestampSeconds = Math.floor(Date.now() / 1000)

			const data = {
				namespace: blueprint.namespace,
				deviceId: config.thingName,
				timestamp: timestampSeconds,
				expiresAt: timestampSeconds + (SECONDS_IN_A_MINUTE * (blueprint.duration || config.defaultDuration)),
				...holdings.data,
				...inputs.data,
				...coils.data,
				...discrete.data,
				geo: getGeo(),
			}

			let topic = blueprint.eventTopic || config.defaultEventTopic

			if (holdings.hasAlert || inputs.hasAlert || coils.hasAlert || discrete.hasAlert) {
				topic = blueprint.alertTopic || config.defaultAlertTopic
			}

			topic = [blueprint.namespace, topic].join('/')

			await util.publishAsync(iotClient, {
				topic,
				payload: JSON.stringify(data),
			})

			console.log(`Event published correctly on topic ${topic}`)
			console.log(data)
		} catch (err) {
			if (err.name === 'PortNotOpenError') {
				console.error('Lost connection with modbus server, trying to connect again')

				return handler({})
			}

			console.error(`Unexpected error: ${err.message}`)
			console.error(err)
		}
	}
}

function handler () {
	const client = new ModbusRTU()

	// open connection based on the blue print configuration
	const { type, address, options, unitId } = blueprint.connection
	client.setID(unitId)

	if (!client['connect' + type]) {
		throw new Error(`Connection type '${type}' is not supported`)
	}

	console.log('Connecting to modbus server. The following blueprint configuration will be used')
	console.log(JSON.stringify(blueprint, null, 2))

	client['connect' + type](address, options, () => run(client))
}

// required to start the long running Lambda in the device
handler()

// dummy handler not really used but needed for the lambda installation
exports.handler = function () {
}
