import { isEqualWith, isString, cloneDeep } from 'lodash'
import { Greengrass } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { DefinitionVersion } from './types'

interface DefinitionVersionNaming {
	readonly name: string
	readonly root: string
	readonly type: string
	readonly typeId: string
	readonly typeDefinitionId: string
	readonly field: string
	readonly groupVersionKey: string
	readonly definitionVersionId: string
	readonly createDefinitionMethod: string
	readonly createDefinitionVersionMethod: string
	readonly getDefinitionMethod: string
	readonly getDefinitionVersionMethod: string
}

export function getDefinitionVersionNaming (definitionName: string): DefinitionVersionNaming {
	const parts = /((Core|Connector|Device|Function|Group|Logger|Resource|Subscription)Definition)Version/.exec(definitionName)

	if (parts == null) {
		throw new Error(`Definition name "${definitionName}" is invalid`)
	}

	const [name, root, type] = parts

	return {
		name,
		root,
		type,
		typeId: `${type}Id`,
		typeDefinitionId: `${type}DefinitionId`,
		field: `${type}s`,
		groupVersionKey: `${name}Arn`,
		definitionVersionId: `${name}Id`,
		createDefinitionMethod: `create${root}`,
		getDefinitionMethod: `get${root}`,
		createDefinitionVersionMethod: `create${name}`,
		getDefinitionVersionMethod: `get${name}`,
	}
}

export function isDefinitionVersionEqual (a: Greengrass.CoreDefinitionVersion, b: Greengrass.CoreDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.ResourceDefinitionVersion, b: Greengrass.ResourceDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.FunctionDefinitionVersion, b: Greengrass.FunctionDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.LoggerDefinitionVersion, b: Greengrass.LoggerDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.ConnectorDefinitionVersion, b: Greengrass.ConnectorDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.DeviceDefinitionVersion, b: Greengrass.DeviceDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: Greengrass.SubscriptionDefinitionVersion, b: Greengrass.SubscriptionDefinitionVersion): boolean
export function isDefinitionVersionEqual (a: DefinitionVersion, b: DefinitionVersion): boolean {
	// @ts-ignore
	return isEqualWith(a, b, (aValue: any, bValue: any, indexOrKey: string | number | symbol) => {
		// Compare all values execpt for ids
		if (isString(indexOrKey) && indexOrKey.endsWith('Id')) {
			return true
		}
	})
}

export function autogenFieldIds (definitionVersion: DefinitionVersion, field: string): DefinitionVersion {
	definitionVersion = cloneDeep(definitionVersion)
	// @ts-ignore
	;(definitionVersion[field] as any[]).forEach(fieldEntry => {
		if (fieldEntry.Id == null) {
			fieldEntry.Id = uuid()
		}
	})

	return definitionVersion
}
