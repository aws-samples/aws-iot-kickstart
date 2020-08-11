import { Greengrass } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { SpecDefinition } from '@deathstar/sputnik-core-api'
import { getDefinitionVersionNaming, isDefinitionVersionEqual, autogenFieldIds } from './utils'
import { GetDefinitionResponse, GetDefinitionVersionResponse, CreateDefinitionVersionResponse, CreateDefinitionVersionRequest } from './types'
import { attachPrincipalPolicy } from '../iot'

const greengrass = new Greengrass()

export async function getGreengrassGroupVersionDefinition (greengrassGroupId: string): Promise<Greengrass.GetGroupVersionResponse | null> {
	console.debug('[getGreengrassGroupVersionDefinition]', greengrassGroupId)
	try {
		const group = await greengrass.getGroup({ GroupId: greengrassGroupId }).promise()

		if (group.LatestVersion) {
			console.debug('[getGreengrassGroupVersionDefinition] Get group version:', greengrassGroupId)
			const groupVersion = await greengrass.getGroupVersion({ GroupId: greengrassGroupId, GroupVersionId: group.LatestVersion }).promise()

			return groupVersion
		} else {
			console.debug('[getGreengrassGroupVersionDefinition] Greengrass group does not have LatestVersion:', greengrassGroupId)

			return null
		}
	} catch (error) {
		console.warn('[getGreengrassGroupVersionDefinition] Error:', error)

		return null
	}
}

export async function syncGreengrassGroupVersion (greengrassGroupId: string, spec: SpecDefinition): Promise<Greengrass.CreateGroupVersionResponse> {
	const currentGroupVersion = await getGreengrassGroupVersionDefinition(greengrassGroupId)
	console.debug('[syncGreengrassGroupVersion] Greengrass::GroupVersion:current', currentGroupVersion)

	const groupVersion: Greengrass.CreateGroupVersionRequest = {
		GroupId: greengrassGroupId,
	}

	const results = await Promise.all(Object.entries(spec).map(async ([key, specDefinitionVersion]): Promise<GetDefinitionVersionResponse> => {
		const {
			type,
			typeDefinitionId,
			field,
			groupVersionKey,
			definitionVersionId,
			getDefinitionMethod,
			getDefinitionVersionMethod,
			createDefinitionMethod,
			createDefinitionVersionMethod,
		} = getDefinitionVersionNaming(key)
		let definition: GetDefinitionResponse

		if (currentGroupVersion?.Definition && currentGroupVersion.Definition[groupVersionKey]) {
			// definition exists in current group
			const typeIdValue = (currentGroupVersion.Definition[groupVersionKey] as string).split('/')[4]
			console.debug('[syncGreengrassGroupVersion] greengrass:', getDefinitionMethod, typeIdValue)
			definition = await greengrass[getDefinitionMethod]({
				[typeDefinitionId]: typeIdValue,
			}).promise()
		} else {
			// definition does not exist in current group
			console.debug('[syncGreengrassGroupVersion] greengrass:', createDefinitionMethod)
			definition = await greengrass[createDefinitionMethod]({
				Name: uuid(),
			}).promise()
		}

		// Add uuid to missing fields
		specDefinitionVersion = autogenFieldIds(specDefinitionVersion, field)

		console.debug('[syncGreengrassGroupVersion] specDefinitionVersion:', specDefinitionVersion)

		const createParams: CreateDefinitionVersionRequest = {
			[typeDefinitionId]: definition.Id,
			...specDefinitionVersion,
		}

		if (currentGroupVersion && definition.LatestVersion) {
			// This means that it already exists. Check if it has changed from existing
			console.debug('[syncGreengrassGroupVersion] greengrass: [existing]', getDefinitionVersionMethod, definition.LatestVersion)
			const currentVersion: GetDefinitionVersionResponse = await greengrass[getDefinitionVersionMethod]({
				[typeDefinitionId]: definition.Id,
				[definitionVersionId]: definition.LatestVersion,
			}).promise()

			if (isDefinitionVersionEqual(currentVersion.Definition as any, specDefinitionVersion)) {
				// Map arn in group version
				groupVersion[groupVersionKey] = currentVersion.Arn

				// There is no change from existing
				return currentVersion
			} else {
				console.debug('[syncGreengrassGroupVersion] greengrass: [existing]', createDefinitionVersionMethod, createParams)
				const createResponse: CreateDefinitionVersionResponse = await greengrass[createDefinitionVersionMethod](createParams).promise()

				// Map arn in group version
				groupVersion[groupVersionKey] = createResponse.Arn

				console.debug('[syncGreengrassGroupVersion] greengrass: [existing]', getDefinitionVersionMethod)

				return greengrass[getDefinitionVersionMethod]({
					[typeDefinitionId]: definition.Id,
					[definitionVersionId]: createResponse.Version,
				}).promise()
			}
		} else {
			// Does not exist yet so lets create it
			console.debug('[syncGreengrassGroupVersion] greengrass: [new]', createDefinitionVersionMethod, createParams)
			const createResponse: CreateDefinitionVersionResponse = await greengrass[createDefinitionVersionMethod](createParams).promise()

			// Map arn in group version
			groupVersion[groupVersionKey] = createResponse.Arn

			console.debug('[syncGreengrassGroupVersion] greengrass:', getDefinitionVersionMethod, createResponse.Version)

			return greengrass[getDefinitionVersionMethod]({
				[typeDefinitionId]: definition.Id,
				[definitionVersionId]: createResponse.Version,
			}).promise()
		}
	}))

	console.debug('[syncGreengrassGroupVersion] Greengrass::GroupVersion:sync:definition:results', results)

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

	await attachPrincipalPolicy(options.iotPolicyName, options.iotPrincipal)
}

export async function createDeployment (groupId: string, version: string, type = 'NewDeployment'): Promise<Greengrass.CreateDeploymentResponse> {
	return greengrass.createDeployment({
		GroupId: groupId,
		DeploymentId: uuid(),
		DeploymentType: type,
		GroupVersionId: version,
	}).promise()
}
