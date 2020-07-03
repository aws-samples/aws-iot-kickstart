const ModbusRTU = require('modbus-serial').default
const util = require('../util').default
const config = require('../config').default

async function execute (command) {
	const client = new ModbusRTU()
	const { blueprint } = config
	const { payload } = command
	const c = blueprint.commands.find(q => q.action === payload.action)

	if (!c) {
		throw new Error(`Command with action '${payload.action}' not found in the BP configuration.`)
	}

	// open connection based on the blue print configuration
	const { type, address, options, unitId } = blueprint.connection
	client.setID(unitId)

	if (!client['connect' + type]) {
		throw new Error(`Connection type '${type}' is not supported`)
	}

	await client['connect' + type](address, options)

	const fnName = 'write' + util.capitalize(c.target)

	if (!client[fnName]) {
		throw new Error(`Command target '${c.target}' is not supported`)
	}

	// if is not defined in the bp it expect it coming from the payload
	const value = c.value === undefined ? payload.value : c.value

	if (value === undefined) {
		throw Error(`Command value to send to address ${c.address} not found. It must be either in the BP configuration or in message payload`)
	}
	console.log(`Preparing to send command to address '${c.address}' with value '${value}'`)

	await client[fnName](c.address, value)

	console.log(`Sent command to address '${c.address}' with value '${value}'`)

	client.close()
}

exports.default = execute
