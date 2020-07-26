
export class IoTEvent {
	namespace: string

	deviceId: string

	deviceIdTimestamp: string

	timestamp: number

	expiresAt: string

	// Stored as JSON string from ddb
	data: string

	constructor (values: Record<string, any> = {}) {
		Object.assign(this, values)
	}
}

export interface IoTEventData {
	[key: string]: string | number | boolean
}

export class IoTEvents {
	namespace: string

	deviceId: string

	events: [IoTEvent]

	constructor (values: Record<string, any> = {}) {
		Object.assign(this, values)
	}
}
