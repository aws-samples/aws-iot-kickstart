const generator = {
	randomFloat: (min, max) => {
		return min + Math.random() * (max - min)
	},
	randomInt: (min, max) => {
		return Math.floor(min + Math.random() * (max - min))
	},
	uptime: () => {
		return process.uptime()
	},
	randomBitmask: (flags, p) => {
		let value = 0
		Object.keys(flags).forEach((key) => {
			if (Math.random() > p) {
				value |= flags[key]
			}
		})

		return value
	},
}

exports.default = generator
