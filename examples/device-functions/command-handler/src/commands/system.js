const ggSdk = require('aws-greengrass-core-sdk')
const util = require('../util').default
const config = require('../config').default

async function execute (command) {
	const iotClient = new ggSdk.IotData()
	const { thingName } = config
	const response = await util.updateThingShadowAsync(iotClient, {
		thingName,
		payload: JSON.stringify({
			state: {
				reported: command.payload,
			},
		}),
	})

	console.log('Shadow updated correctly. Response: ')
	console.log(response)
}

exports.default = execute
