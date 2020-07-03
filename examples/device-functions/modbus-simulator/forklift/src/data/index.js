const generator = require('./generator').default

const simulate = () => {
	const addressData = {
		// Speed
		40061: generator.randomInt(6, 10),
		// Weight of Load
		40062: generator.randomInt(25, 40),
		// Battery
		40063: generator.randomInt(80, 98),
		// Utilization
		40064: generator.randomInt(250, 400),
		// Minor Shock Count
		40065: generator.randomInt(10, 15),
		// Medium Shock Count
		40066: generator.randomInt(3, 10),
		// Major Shock Count
		40067: generator.randomInt(0, 6),
	}

	return addressData
}

exports.default = simulate
