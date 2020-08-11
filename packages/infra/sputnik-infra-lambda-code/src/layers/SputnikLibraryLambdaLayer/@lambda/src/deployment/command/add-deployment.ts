import { DynamoDB } from 'aws-sdk'
import { isEmpty } from 'lodash'
import { v4 as uuid } from 'uuid'
import { DEFAULT_NAMESPACE as CORE_DEFAULT_NAMESPACE, mergeSpecs, substituteSpec, extractDeviceMappingSubstitutions } from '@deathstar/sputnik-core'
import { SpecDefinition, Device, DeviceBlueprint, DeviceType, AddBatchDeploymentResponse, BatchDeploymentResult } from '@deathstar/sputnik-core-api'
import { EnvironmentVariables } from '../handler/environment'
import { syncGreengrassGroupVersion, applyGroupPermissions, createDeployment } from '../greengrass/group'
import { saveDeployment, updateDeviceDeployment, DeploymentItem } from '../deployment'
import { updateIoTDeviceShadow, getIoTPrincipals } from '../iot'
import { result } from 'underscore'

const {
	AWS_ACCOUNT,
	AWS_REGION,
	DEFAULT_NAMESPACE = CORE_DEFAULT_NAMESPACE,
	TABLE_DEVICES,
	TABLE_DEVICE_TYPES,
	TABLE_DEVICE_BLUEPRINTS,
	TABLE_DEPLOYMENTS,
	DATA_BUCKET,
	IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS,
	IOT_POLICY_GREENGRASS_CORE,
	IOT_ENDPOINT,
} = process.env as unknown as EnvironmentVariables

const documentClient = new DynamoDB.DocumentClient()

export const CMD_ADD_DEPLOYMENT = 'addDeployment'
export const CMD_ADD_BATCH_DEPLOYMENT = 'addBatchDeployment'

async function getDevice (thingId: string): Promise<Device> {
	try {
		console.debug('[getDevice]', thingId)
		const { Item } = await documentClient.get({
			TableName: TABLE_DEVICES,
			Key: {
				thingId: thingId,
			},
		}).promise()

		return Item as Device
	} catch (error) {
		console.error('[getDevice]', error)
		throw error
	}
}

async function getDeviceType (deviceTypeId: string): Promise<DeviceType> {
	try {
		console.debug('[getDeviceType]', deviceTypeId)
		const { Item } = await documentClient.get({
			TableName: TABLE_DEVICE_TYPES,
			Key: {
				id: deviceTypeId,
			},
		}).promise()

		return Item as DeviceType
	} catch (error) {
		console.error('[getDeviceType]', error)
		throw error
	}
}

async function getDeviceBlueprint (deviceBlueprintId: string): Promise<DeviceBlueprint> {
	try {
		console.debug('[getDeviceBlueprint]', deviceBlueprintId)
		const { Item } = await documentClient.get({
			TableName: TABLE_DEVICE_BLUEPRINTS,
			Key: {
				id: deviceBlueprintId,
			},
		}).promise()

		return Item as DeviceBlueprint
	} catch (error) {
		console.error('[getDeviceBlueprint]', error)
		throw error
	}
}

function interpolateSubstitutions (device: Device, certificateArn: string) {
	return {
		AWS_ACCOUNT,
		AWS_REGION,
		THING_NAME: device.thingName,
		CORE: device.thingName,
		CORE_ARN: device.thingArn,
		CORE_CERTIFICATE_ARN: certificateArn,
		DATA_BUCKET,
		IOT_ENDPOINT,
		DATA_BUCKET_S3_URL: `https://${DATA_BUCKET}.s3.amazonaws.com`,
		NAMESPACE: device.namespace || DEFAULT_NAMESPACE,
		DEFAULT_NAMESPACE,
	}
}

export async function addDeployment (thingId: string): Promise<DeploymentItem> {
	try {
		console.debug('[addDeployment]', thingId)
		const device = await getDevice(thingId)
		console.debug('[addDeployment] Device:', device)

		const [deviceType, deviceBlueprint] = await Promise.all([
			getDeviceType(device.deviceTypeId),
			getDeviceBlueprint(device.deviceBlueprintId),
		])

		console.debug('[addDeployment] Device Type:', deviceType)
		console.debug('[addDeployment] Device Blueprint:', deviceBlueprint)

		if (deviceType == null || deviceBlueprint == null) {
			throw new Error('Device Type or Device Blueprint do not exist in DB')
		}

		console.debug('[addDeployment] getIoTPrincipals:', device.thingName)
		const principals = await getIoTPrincipals(device.thingName)
		const certificateArn = principals[0]

		// subsequent specs override previous, order is important
		// deviceType < deviceBlueprint < device
		const specs: SpecDefinition[] = []

		if (deviceType.spec) {
			console.debug(`[addDeployment] DeviceType Spec: ${JSON.stringify(deviceType.spec, null, 4)}`)
			specs.push(deviceType.spec)
		}

		if (deviceBlueprint.spec) {
			console.debug(`[addDeployment] DeviceBlueprint Spec: ${JSON.stringify(deviceBlueprint.spec, null, 4)}`)
			specs.push(deviceBlueprint.spec)
		}

		if (device.spec) {
			console.debug(`[addDeployment] Device Spec: ${JSON.stringify(device.spec, null, 4)}`)
			specs.push(device.spec)
		}

		// merge specs
		console.debug('[addDeployment] Merging specs:', ...specs)
		let spec = mergeSpecs(...specs)
		console.debug('[addDeployment] Merged spec:', spec)

		// get base substitutions
		const substitutions = interpolateSubstitutions(device, certificateArn)
		// include device mapping substitutions
		Object.assign(substitutions, extractDeviceMappingSubstitutions(device.deviceTypeId, deviceBlueprint.deviceTypeMappings))
		// apply all substitutions to spec
		spec = substituteSpec(spec, substitutions)

		let deploymentItem: DeploymentItem

		console.log('ENV:', IOT_ENDPOINT)

		if (deviceType.type === 'GREENGRASS' && deviceBlueprint.type === 'GREENGRASS') {
			console.debug('[addDeployment] Device is Greengrass:', device.greengrassGroupId)

			const groupVersion = await syncGreengrassGroupVersion(device.greengrassGroupId, spec)

			// TODO: make this configurable, for now disabling as has side-effects
			// console.debug('Attach IAM role to group just in case')
			// console.debug('Attach IOT Greengrass policy to group just in case')

			// await applyGroupPermissions(device.greengrassGroupId, {
			// 	roleArn: IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS,
			// 	iotPolicyName: IOT_POLICY_GREENGRASS_CORE,
			// 	iotPrincipal: certificateArn,
			// })

			const deployment = await createDeployment(device.greengrassGroupId, groupVersion.Version as string)

			console.debug(`[addDeployment] Deployed: ${deployment.DeploymentId}`)

			deploymentItem = {
				thingId: device.thingId,
				deploymentId: deployment.DeploymentId as string,
				spec: spec,
				type: 'GREENGRASS',
				greengrassGroup: {
					Id: device.greengrassGroupId,
					VersionId: groupVersion.Version as string,
				},
				createdAt: (new Date()).toISOString(),
				updatedAt: (new Date()).toISOString(),
			}
		} else {
			console.debug('[addDeployment] Device is NOT a greengrass device, or at least not detected as one. OR the deviceBlueprint/deviceType combination is not for a Greengrass device')

			deploymentItem = {
				thingId: device.thingId,
				deploymentId: uuid(),
				spec: spec,
				type: deviceType.type,
				createdAt: (new Date()).toISOString(),
				updatedAt: (new Date()).toISOString(),
			}
		}

		await saveDeployment(TABLE_DEPLOYMENTS, deploymentItem)
		await updateDeviceDeployment(TABLE_DEVICES, device.thingId, deploymentItem)

		if (!isEmpty(spec.Shadow)) {
			await updateIoTDeviceShadow(device.thingName, spec.Shadow)
		}

		console.debug('[addDeployment] Success', deploymentItem)

		return deploymentItem
	} catch (error) {
		console.error('[addDeployment] Failed to "addDeployment"', error)

		throw error
	}
}

export async function addBatchDeployment (thingIds: string[]): Promise<AddBatchDeploymentResponse> {
	console.debug('[addBatchDeployment]', thingIds)

	const failed: string[] = []

	try {
		const promises = thingIds.map((thingId) => {
			return Promise.resolve(addDeployment(thingId)).then(
				result => ({ thingId, result, success: true }),
				error => {
					failed.push(thingId)

					return { thingId, reason: error.message, success: false }
				},
			)
		})

		const results = await Promise.all(promises)
		const success = failed.length === 0
		console.debug('[addBatchDeployment] result:', result, success)

		return {
			code: success ? 'SUCCESS' : 'FAILED',
			success,
			message: success ? `Deployed ${thingIds.length} devices` : `Failed to deploy ${failed.length} of ${thingIds.length} devices`,
			deployments: results,
		}
	} catch (error) {
		console.error('[addBatchDeployment] Caught Error:', error)

		return {
			code: error.code || 'ERROR',
			success: false,
			message: error.message,
			deployments: [],
		}
	}
}
