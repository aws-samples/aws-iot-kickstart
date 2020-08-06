import { getDeviceStats } from './getDeviceStats'
import { addDevice } from './addDevice'
import { deleteDevice } from './deleteDevice'
import { updateDevice } from './updateDevice'
import { createCertificate } from './createCertificate'
import { test } from './test'

export const commands = {
	getDeviceStats,
	addDevice,
	deleteDevice,
	updateDevice,
	createCertificate,
	test,
}

export default commands
