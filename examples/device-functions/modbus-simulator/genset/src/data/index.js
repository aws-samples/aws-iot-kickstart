const generator = require('./generator').default

const flags = {
	Overspeed: 1 << 0,
	Underspeed: 1 << 1,
	LowOilPressure: 1 << 2,
	HighWaterTemperature: 1 << 3,
	BatteryUndevoltage: 1 << 4,
	BatteryOvervoltage: 1 << 5,
	MaintenanceReminder: 1 << 6,
	GensetOvervoltage: 1 << 7,
	GensetUndervoltage: 1 << 8,
	GensetOverfrequency: 1 << 9,
	GensetUnderfrequency: 1 << 10,
}

const splitRegistryValue = (p) => {
	const value = Math.floor(p)
	const low = value - 65536 > 0 ? 65536 : value
	const high = value - 65536 > 0 ? (value - 65536) / 65536 : 0

	return {
		high,
		low,
	}
}

const simulate = (running) => {
	const addressData = {
		// Battery voltage
		40061: generator.randomInt(116, 125),
		// oil pressure
		40062: running ? generator.randomInt(300, 500) : 0,
		// load capacity
		40063: running ? generator.randomInt(150, 200) : 0,
		// coolant temperature
		40064: running ? generator.randomInt(350, 450) : generator.randomInt(150, 250),
		// LCP Mode (static)
		40065: 0,
		// Engine status (static)
		40066: running ? 3 : 0,
		// fuel rate
		40067: running ? generator.randomInt(20, 30) : 0,
		// Engine Speed
		40068: running ? generator.randomInt(1400, 1600) : 0,
		// Running Hours (first address)
		40070: splitRegistryValue(generator.uptime()).low,
		// Running Hours (second address)
		40071: splitRegistryValue(generator.uptime()).high,
		// Voltage single phase
		40072: running ? generator.randomInt(470, 490) : 0,
		// Voltage three phase
		40073: running ? generator.randomInt(470, 490) : 0,
		// Current each phase
		40074: running ? generator.randomInt(470, 490) : 0,
		// Power kiloWatt
		40075: running ? generator.randomInt(520, 630) : 0,
		// Frequency
		40076: running ? generator.randomInt(50, 60) : 0,
		// random based on bitmask (will be false for 0.9 of the times)
		40077: running ? generator.randomBitmask(flags, 0.9) : 0,
	}

	return addressData
}

exports.default = simulate
