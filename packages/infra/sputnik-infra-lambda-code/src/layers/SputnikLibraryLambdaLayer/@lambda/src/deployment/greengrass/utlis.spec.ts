import { getDefinitionVersionNaming } from './utils'

// TODO: move this to global
type JestExpect = <R>(actual: R) => jest.Matchers<R> & jasmine.Matchers<R>;
declare const expect: JestExpect;

describe('utils', () => {
	describe('getDefinitionVersionParts', () => {
		test('should get definition parts', () => {
			// ["CoreDefinitionVersion", "CoreDefinition", "Core"]
			const parts = getDefinitionVersionNaming('CoreDefinitionVersion')

			expect(parts.name).toBe('CoreDefinitionVersion')
			expect(parts.root).toBe('CoreDefinition')
			expect(parts.type).toBe('Core')
			expect(parts.typeId).toBe('CoreId')
			expect(parts.field).toBe('Cores')
			expect(parts.groupVersionKey).toBe('CoreDefinitionVersionArn')
			expect(parts.definitionVersionId).toBe('CoreDefinitionVersionId')
			expect(parts.createDefinitionMethod).toBe('createCoreDefinition')
			expect(parts.createDefinitionVersionMethod).toBe('createCoreDefinitionVersion')
			expect(parts.getDefinitionMethod).toBe('getCoreDefinition')
			expect(parts.getDefinitionVersionMethod).toBe('getCoreDefinitionVersion')
		})
	})
})
