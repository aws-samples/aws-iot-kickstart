const commands = require('../command')

function handler (event, context, callback) {
	console.log('Event:', JSON.stringify(event, null, 2))

	let promise = null

	switch (event.cmd) {
		case 'getDeviceStats':
			promise = commands.getDeviceStats
			break
		case 'addDevice':
			promise = commands.addDevice
			break
		case 'deleteDevice':
			promise = commands.deleteDevice
			break
		case 'updateDevice':
			promise = commands.updateDevice
			break
		case 'createCertificate':
			promise = commands.createCertificate
			break
		case 'test':
			promise = commands.test
			break
		default:
			callback('Unknown cmd, unable to resolve for arguments: ' + event, null)
			break
	}

	if (promise) {
		promise(event, context).then(result => {
			callback(null, result)
		}).catch(err => {
			callback(err, null)
		})
	}
}

exports.handler = handler
