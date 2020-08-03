import { Greengrass, Iot } from 'aws-sdk'
import { GroupVersion } from 'aws-sdk/clients/greengrass'
import { v4 as uuid } from 'uuid'
import { SpecDefinition } from '@deathstar/sputnik-core-api'
import { getDefinitionVersionNaming, isDefinitionVersionEqual, autogenFieldIds } from './utils'
import { GetDefintionResponse, GetDefinitionVersionResponse, CreateDefinitionVersionResponse } from './types'

const greengrass = new Greengrass()
const iot = new Iot()

export async function getGreengrassGroupVersionDefinition (greengrassGroupId: string): Promise<GroupVersion | null> {
	try {
		const group = await greengrass.getGroup({ GroupId: greengrassGroupId }).promise()

		if (group.LatestVersion) {
			const grouopVersion = await greengrass.getGroupVersion({ GroupId: greengrassGroupId, GroupVersionId: group.LatestVersion }).promise()

			return grouopVersion.Definition
		} else {
			console.log(`Greengrass group ${greengrassGroupId} does not have LatestVersion`)

			return null
		}
	} catch (error) {
		console.warn(error)

		return null
	}
}

export async function syncGreengrassGroupVersion (greengrassGroupId: string, spec: SpecDefinition): Promise<Greengrass.CreateGroupVersionResponse> {
	const currentGroupVersion = await getGreengrassGroupVersionDefinition(greengrassGroupId)
	console.debug('Greengrass::GroupVersion:current', currentGroupVersion)

	const groupVersion: Greengrass.CreateGroupVersionRequest = {
		GroupId: greengrassGroupId,
	}

	const results = await Promise.all(Object.entries(spec).map(async ([key, specDefinitionVersion]): Promise<GetDefinitionVersionResponse> => {
		const {
			type,
			typeId,
			field,
			groupVersionKey,
			definitionVersionId,
			getDefinitionMethod,
			getDefinitionVersionMethod,
			createDefinitionMethod,
			createDefinitionVersionMethod,
		} = getDefinitionVersionNaming(key)
		let definition: GetDefintionResponse

		if (currentGroupVersion && currentGroupVersion[groupVersionKey] != null) {
			// definition exists in current group
			definition = greengrass[getDefinitionMethod]({
				[typeId]: (currentGroupVersion[groupVersionKey] as string).split('/')[4]
			}).promise()
		} else {
			// definition does not exist in current group
			definition = await greengrass[createDefinitionMethod]({
				Name: uuid(),
			}).promise()
		}

		// Add uuid to missing fields
		specDefinitionVersion = autogenFieldIds(specDefinitionVersion, field)

		if (definition.LatestVersion) {
			// This means that it already exists. Check if it has changed from existing
			const currentVersion: GetDefinitionVersionResponse = await greengrass[getDefinitionVersionMethod]({
				[definitionVersionId]: definition.LatestVersion,
			}).promise()

			if (isDefinitionVersionEqual(currentVersion.Definition as unknown, specDefinitionVersion)) {
				// Map arn in group version
				groupVersion[groupVersionKey] = currentVersion.Arn

				// There is no change from existing
				return currentVersion
			} else {
				const createResponse: CreateDefinitionVersionResponse = await greengrass[createDefinitionVersionMethod](specDefinitionVersion).promise()

				// Map arn in group version
				groupVersion[groupVersionKey] = createResponse.Arn

				return greengrass[getDefinitionVersionMethod]({
					[definitionVersionId]: createResponse.Version,
				}).promise()
			}
		} else {
			// Does not exist yet so lets create it
			const createResponse: CreateDefinitionVersionResponse = await greengrass[createDefinitionVersionMethod](specDefinitionVersion).promise()

			// Map arn in group version
			groupVersion[groupVersionKey] = createResponse.Arn

			return greengrass[getDefinitionVersionMethod]({
				[definitionVersionId]: createResponse.Version,
			}).promise()
		}
	}))

	console.debug('Greengrass::GroupVersion:sync:definition:results', results)

	return greengrass.createGroupVersion(groupVersion).promise()
}

interface GroupVersionPermissionOptions {
	roleArn: string
	iotPolicyName: string
	iotPrincipal: string
}

export async function applyGroupPermissions (groupId: string, options: GroupVersionPermissionOptions) {
	await greengrass.associateRoleToGroup({
		RoleArn: options.roleArn,
		GroupId: groupId,
	}).promise()

	await iot.attachPrincipalPolicy({
		policyName: options.iotPolicyName,
		principal: options.iotPrincipal,
	}).promise()
}

export async function createDeployment (groupId: string, version: string, type: string = 'NewDeployment'): Promise<Greengrass.CreateDeploymentResponse> {
	return greengrass.createDeployment({
		GroupId: groupId,
		DeploymentId: uuid(),
		DeploymentType: type,
		GroupVersionId: version,
	}).promise()
}
