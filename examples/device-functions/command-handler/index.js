const commands = require('./src/commands').default

exports.handler = async function (event) {
	console.log('Received event: ')
	console.log(JSON.stringify(event, null, 2))

	const { command } = event

	if (!commands[command.type]) {
		console.error(`Unrecognized command type '${command.type}', event would be skipped`)

		return -1
	}

	try {
		await commands[command.type](command)
	} catch (err) {
		console.log('Error performing the command')
		console.log(err)
	}
}
