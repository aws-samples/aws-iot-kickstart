import { Device } from '@deathstar/sputnik-core-api'
import { DEVICE_BLUEPRINT_1 } from './device-blueprint'
import { DEVICE_TYPE_1 } from './device-type'

export const DEVICE_1: Device = {
	thingId: 'test-thing-1',
	thingName: 'test-thing-1',
	deviceBlueprintId: DEVICE_BLUEPRINT_1.id,
	deviceTypeId: DEVICE_TYPE_1.id,
	greengrassGroupId: 'gg-group-1',
	name: 'Test Device',
	thingArn: 'test-thing-arn',
	certificateArn: 'test-cert-arn',
	spec: {},
}
