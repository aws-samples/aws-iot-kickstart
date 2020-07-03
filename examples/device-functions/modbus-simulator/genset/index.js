const ModbusRTU = require('modbus-serial')
const simulate = require('./src/data').default

let running = true
const simulatorHandler = (addr) => {
	const data = simulate(running)

	if (Object.keys(data).includes(addr.toString())) {
		console.log(`Sending value for ${addr}: ${data[addr]}`)

		return data[addr]
	}

	console.error(`${addr} not configured, sending: 0`)

	return 0
}

const vector = {
	getInputRegister: function (addr, unitID) {
		console.log('getInputRegister')

		return simulatorHandler(addr)
	},
	getHoldingRegister: function (addr, unitID) {
		console.log('getHoldingRegister')

		return simulatorHandler(addr)
	},
	getCoil: function (addr, unitID) {
		console.log('getCoil')

		return simulatorHandler(addr) === true
	},
	setRegister: function (addr, value, unitID) {
		console.log('set register', addr, value, unitID)
	},
	setCoil: function (addr, value, unitID) {
		// start/stop address for simulation
		if (addr === 40001) {
			running = value
		}

		console.log('set coil', addr, value, unitID)
	},
	readDeviceIdentification: function (addr) {
		return {
			0x00: 'MyVendorName',
			0x01: 'MyProductCode',
			0x02: 'MyMajorMinorRevision',
			0x05: 'MyModelName',
			0x97: 'MyExtendedObject1',
			0xab: 'MyExtendedObject2',
		}
	},
}

function handler () {
	// set the server to answer for modbus requests
	console.log('ModbusTCP listening on modbus://0.0.0.0:8502')
	var serverTCP = new ModbusRTU.ServerTCP(vector, {
		host: '0.0.0.0',
		port: 8502,
		debug: true,
		unitID: 1,
	})

	serverTCP.on('socketError', function (err) {
		console.error(err)
	})
}

// to be called so that the server will start once the lambda is deployed
handler()

exports.handler = handler
