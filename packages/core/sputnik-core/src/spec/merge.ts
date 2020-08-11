import { mergeWith, isArray, unionBy, cloneDeep } from 'lodash'
import { SpecDefinition } from '@deathstar/sputnik-core-api'

function mergeUniqueBy (value: any[], srcValue: any[], key: string): any[] {
	// srcValue has precedence
	// reverse to preserve original specs definitions
	return unionBy((srcValue || []).reverse(), (value || []).reverse(), key).reverse()
}

function mergeCustomizer (value: any, srcValue: any, key: string, object: any, source: any): any {
	switch (key) {
		case 'Cores':
			return srcValue
		case 'Devices':
			return mergeUniqueBy(value, srcValue, 'ThingArn')
		case 'Functions':
			return mergeUniqueBy(value, srcValue, 'FunctionArn')
		case 'Resources':
			return mergeUniqueBy(value, srcValue, 'Id')
		case 'Connectors':
			return mergeUniqueBy(value, srcValue, 'ConnectorArn')
	}

	if (isArray(value)) {
		return value.concat(srcValue)
	}
}

export function mergeSpecs (...specs: SpecDefinition[]): SpecDefinition {
	if (specs.length < 1) {
		throw new Error('Must specify at least 1 spec')
	}

	const spec = cloneDeep<SpecDefinition>(specs.shift() as SpecDefinition)
	specs.forEach(specToMerge => {
		mergeWith(spec, specToMerge, mergeCustomizer)
	})

	return spec
}
