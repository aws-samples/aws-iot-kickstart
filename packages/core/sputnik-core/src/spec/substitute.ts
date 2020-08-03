import { cloneDeepWith, isString } from 'lodash'
import { SpecDefinition } from '@deathstar/sputnik-core-api'

interface Substitutions {
	[key: string]: string
}

interface DeviceMapping {
	substitute: string
	value: {
		[key: string]: string
	}
}

export function substituteSpec (spec: SpecDefinition, substitutions: Substitutions): SpecDefinition {
	const subs = Object.entries(substitutions)

	return cloneDeepWith(spec, (value) => {
		if (isString(value)) {
			subs.forEach(([key, sub]) => {
				value = value.replace(`[${key}]`, sub)
			})

			return value
		}
	})
}

export function extractDeviceMappingSubstitutions (deviceTypeId: string, deviceMappings: DeviceMapping[]): Substitutions {
	return (deviceMappings || []).reduce((subs, mapping) => {
		if (mapping.value[deviceTypeId]) {
			return {
				...subs,
				[mapping.substitute]: mapping.value[deviceTypeId],
			}
		}

		return subs
	}, {} as Substitutions)
}
