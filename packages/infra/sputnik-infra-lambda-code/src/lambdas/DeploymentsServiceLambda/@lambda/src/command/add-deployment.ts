import { DynamoDB } from 'aws-sdk'
import { isEmpty } from 'lodash'
import { v4 as uuid } from 'uuid'
import { DEFAULT_NAMESPACE as CORE_DEFAULT_NAMESPACE, mergeSpecs, substituteSpec, extractDeviceMappingSubstitutions } from '@deathstar/sputnik-core'
import { SpecDefinition, Device, DeviceBlueprint, DeviceType } from '@deathstar/sputnik-core-api'
import { EnvironmentVariables } from '../environment'
import { syncGreengrassGroupVersion, applyGroupPermissions, createDeployment } from '../greengrass/group'
import { saveDeployment, updateDeviceDeployment, DeploymentItem } from '../deployment'
import { updateIoTDeviceShadow, getIoTPrincipals } from '../iot'

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

export const ADD_DEPLOYMENT_CMD = 'addDeployment'

async function getDevice (thingId: string): Promise<Device> {
	return documentClient.get({
		TableName: TABLE_DEVICES,
		Key: {
			thingId: thingId,
		},
	}).promise() as unknown as Promise<Device>
}

async function getDeviceType (deviceTypeId: string): Promise<DeviceType> {
	return documentClient.get({
		TableName: TABLE_DEVICE_TYPES,
		Key: {
			id: deviceTypeId,
		},
	}).promise() as unknown as Promise<DeviceType>
}

async function getDeviceBlueprint (deviceBlueprintId: string): Promise<DeviceBlueprint> {
	return documentClient.get({
		TableName: TABLE_DEVICE_BLUEPRINTS,
		Key: {
			id: deviceBlueprintId,
		},
	}).promise() as unknown as Promise<DeviceBlueprint>
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

export async function addDeployment (event) {
	try {
		const device = await getDevice(event.thingId)
		const [deviceType, deviceBlueprint] = await Promise.all([
			getDeviceType(device.deviceTypeId),
			getDeviceBlueprint(device.deviceBlueprintId),
		])

		console.log('Device:', device)
		console.log('Device Type:', deviceType)
		console.log('Device Blueprint:', deviceBlueprint)

		if (deviceType == null || deviceBlueprint == null) {
			throw new Error('Device Type or Device Blueprint do not exist in DB')
		}

		const principals = await getIoTPrincipals(device.thingName)
		const certificateArn = principals[0]

		// subsequent specs override previous, order is important
		// deviceType < deviceBlueprint < device
		const specs: SpecDefinition[] = []

		if (deviceType.spec) {
			console.log(`DeviceType Spec: ${JSON.stringify(deviceType.spec, null, 4)}`)
			specs.push(deviceType.spec)
		}

		if (deviceBlueprint.spec) {
			console.log(`DeviceBlueprint Spec: ${JSON.stringify(deviceBlueprint.spec, null, 4)}`)
			specs.push(deviceBlueprint.spec)
		}

		if (device.spec) {
			console.log(`Device Spec: ${JSON.stringify(device.spec, null, 4)}`)
			specs.push(device.spec)
		}

		// merge specs
		let spec = mergeSpecs(...specs)

		// get base substitutions
		const substitutions = interpolateSubstitutions(device, certificateArn)
		// include device mapping substitutions
		Object.assign(substitutions, extractDeviceMappingSubstitutions(device.deviceTypeId, deviceBlueprint.deviceTypeMappings))
		// apply all substitutions to spec
		spec = substituteSpec(spec, substitutions)

		let deploymentItem: DeploymentItem

		if (deviceType.type === 'GREENGRASS' && deviceBlueprint.type === 'GREENGRASS') {
			console.log('Device is Greengrass')

			const groupVersion = await syncGreengrassGroupVersion(device.greengrassGroupId, spec)

			console.log('Attach IAM role to group just in case')
			console.log('Attach IOT Greengrass policy to group just in case')

			await applyGroupPermissions(device.greengrassGroupId, {
				roleArn: IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS,
				iotPolicyName: IOT_POLICY_GREENGRASS_CORE,
				iotPrincipal: certificateArn,
			})

			const deployment = await createDeployment(device.greengrassGroupId, groupVersion.Version)

			console.log(`Deployed: ${deployment.DeploymentId}`)

			deploymentItem = {
				thingId: device.thingId,
				deploymentId: deployment.DeploymentId,
				spec: spec,
				type: 'GREENGRASS',
				greengrassGroup: {
					Id: device.greengrassGroupId,
					VersionId: groupVersion.Version,
				},
				createdAt: (new Date()).toISOString(),
				updatedAt: (new Date()).toISOString(),
			}

		} else {
			console.log('Device is NOT a greengrass device, or at least not detected as one. OR the deviceBlueprint/deviceType combination is not for a Greengrass device')

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

		console.log('Success', deploymentItem)
	} catch (error) {
		console.error('Failed to "addDeployment"', error)

		throw error
	}
}
