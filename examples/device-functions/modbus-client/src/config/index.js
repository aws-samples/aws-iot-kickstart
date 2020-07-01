exports.default = {
	thingName: process.env.THING_NAME,
	namespace: process.env.NAMESPACE,
	blueprint: JSON.parse(process.env.MODBUS_MAPPING),
	defaultAlertTopic: 'data/alert',
	defaultEventTopic: 'data/event',
	defaultInterval: process.env.RT_INTERVAL || 2, // in seconds
	// TTL
	defaultDuration: process.env.RT_DURATION || 1440, // in minutes
}
