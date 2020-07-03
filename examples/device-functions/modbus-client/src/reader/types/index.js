const hex2ascii = (hex) => {
	let str = ''

	for (let i = 0; i < hex.length; i += 2) {
		const v = parseInt(hex.substr(i, 2), 16)

		if (v) {
			str += String.fromCharCode(v)
		}
	}

	return str
}

// standard will read only the first registry value, to be used with quantity=1
const standard = (registry, values) => {
	return values[0] * registry.multiplier
}

// bit will read only the first registry value, to be used with quantity=1
const bit = (registry, values) => {
	return ((values[0] * registry.multiplier) & (1 << registry.bitNumber)) > 0
}

// to be used to read multiple value, to be used with quantity=2
const multi = async (registry, values, quantity) => {
	if (quantity > 1) {
		const registerValue = values[0] * registry.multiplier
		let nextValue = values[1]

		const minValue = Math.min(registerValue, nextValue)
		const maxValue = Math.max(registerValue, nextValue)

		return (
			minValue * registry.multiplier * registry.lowValueMultiplier +
			maxValue * registry.multiplier
		)
	} else {
		console.warn(
			`Can't read the multi value from the registry as quantity is ${quantity}, will return standard value`,
		)

		return standard(registry, values)
	}
}

// to be used to read multiple value, to be used with quantity > 2
const string = async (registry, values, quantity) => {
	let hex = ''
	for (let i = 0; i < quantity; i++) {
		const value = values[i] * registry.multiplier
		const high = (value >> 8) & 0xff
		const low = value & 0xff

		hex += high.toString(16)
		hex += low.toString(16)
	}

	return hex2ascii(hex)
}

exports.default = {
	standard,
	bit,
	multi,
	string,
}
