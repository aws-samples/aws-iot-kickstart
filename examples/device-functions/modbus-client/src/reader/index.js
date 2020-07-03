const types = require('./types').default
const comparator = require('./comparator').default

const reader = async (registerConfiguration, client, fn) => {
	if (
		!registerConfiguration ||
		!registerConfiguration.registers ||
		registerConfiguration.registers.length === 0
	) {
		return {}
	}

	const { registers } = registerConfiguration
	const currentValue = {}
	let hasAlert = false

	for (var i = 0; i < registers.length; i++) {
		const registry = registers[i]
		const count = registry.quantity || 1

		let result = null
		try {
			result = await client[fn](registry.address, count)
		} catch (err) {
			console.warn(
				`Unable to read data from registry '${registry.address}', count=${count}. The block will be skipped`,
			)
			console.warn(err)

			continue
		}

		const { data } = result

		const typeFn = types[registry.type || 'standard'] || types.standard

		try {
			currentValue[registry.fieldName] = await typeFn(
				registry,
				data,
				count,
			)
		} catch (err) {
			console.warn(
				`Unable to read registry '${registry.address}' for field '${registry.fieldName}'. The item will be skipped`,
			)
			console.warn(err)

			continue
		}

		if (registry.alert && !hasAlert) {
			hasAlert = comparator(
				currentValue[registry.fieldName],
				registry.alert.operator,
				registry.alert.target,
			)
		}
	}

	return {
		data: currentValue,
		hasAlert,
	}
}

exports.default = reader
