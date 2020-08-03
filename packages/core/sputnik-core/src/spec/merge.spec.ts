import { SpecDefinition } from '@deathstar/sputnik-core-api'
import { mergeSpecs } from './merge'

// TODO: move this to global
type JestExpect = <R>(actual: R) => jest.Matchers<R> & jasmine.Matchers<R>;
declare const expect: JestExpect;

describe('merge', () => {
	test('should merge all specs', () => {
		const deviceSpec = createSpec('device')
		const deviceTypeSpec = createSpec('device-type')
		const deviceBlueprintSpec = createSpec('device-blueprint')

		const spec = mergeSpecs(deviceBlueprintSpec, deviceTypeSpec, deviceSpec)

		expect(spec).toMatchSnapshot('merge-all')
	})

	test('should override', () => {
		const deviceSpec = createSpec('device')
		const deviceTypeSpec = createSpec('device-type')
		const deviceBlueprintSpec = createSpec('device-blueprint')

		if (deviceBlueprintSpec.FunctionDefinitionVersion && deviceSpec.FunctionDefinitionVersion) {
			deviceSpec.FunctionDefinitionVersion.Functions[0].FunctionArn = 'override-device'
			deviceBlueprintSpec.FunctionDefinitionVersion.Functions[0].FunctionArn = 'override-device'
		}

		if (deviceTypeSpec.ConnectorDefinitionVersion && deviceSpec.ConnectorDefinitionVersion) {
			deviceSpec.ConnectorDefinitionVersion.Connectors[0].ConnectorArn = 'override-device'
			deviceTypeSpec.ConnectorDefinitionVersion.Connectors[0].ConnectorArn = 'override-device'
		}

		const spec = mergeSpecs(deviceBlueprintSpec, deviceTypeSpec, deviceSpec)

		expect(spec.FunctionDefinitionVersion?.Functions.length).toBe(2)
		expect(spec.FunctionDefinitionVersion?.Functions[1]).toEqual(deviceSpec.FunctionDefinitionVersion?.Functions[0])

		expect(spec.ConnectorDefinitionVersion?.Connectors.length).toBe(2)
		expect(spec.ConnectorDefinitionVersion?.Connectors[1]).toEqual(deviceSpec.ConnectorDefinitionVersion?.Connectors[0])
	})
})

function createSpec (prefix: string): SpecDefinition {
	return {
		CoreDefinitionVersion: {
			Cores: [
				{
					CertificateArn: `${prefix}-CertificateArn`,
					Id: `${prefix}-Id`,
					ThingArn: `${prefix}-ThingArn`,
				}
			]
		},
		ConnectorDefinitionVersion: {
			Connectors: [
				{
					ConnectorArn: `${prefix}-ConnectorArn`,
					Id: `${prefix}-Id`,
					Parameters: `${prefix}-Parameters`,
				}
			]
		},
		DeviceDefinitionVersion: {
			Devices: [
				{
					CertificateArn: `${prefix}-CertificateArn`,
					Id: `${prefix}-Id`,
					ThingArn: `${prefix}-ThingArn`,
				}
			]
		},
		FunctionDefinitionVersion: {
			DefaultConfig: {
				Execution: {
					RunAs: {
						Gid: 111,
						Uid: 111,
					},
				}
			},
			Functions: [
				{
					FunctionArn: `${prefix}-FunctionArn`,
					FunctionConfiguration: {
						EncodingType: `${prefix}-EncodingType`,
					},
					Id: `${prefix}-Id`,
				}
			]
		},
		LoggerDefinitionVersion: {
			Loggers: [
				{
					Id: `${prefix}-Id`,
					Component: `${prefix}-Component`,
					Level: `${prefix}-Level`,
					Type: `${prefix}-Type`,
				}
			]
		},
		ResourceDefinitionVersion: {
			Resources: [
				{
					Id: `${prefix}-Id`,
					Name: `${prefix}-Name`,
					ResourceDataContainer: {
						LocalDeviceResourceData: {
							SourcePath: `${prefix}-SourcePath`,
						},
						LocalVolumeResourceData: {
							SourcePath: `${prefix}-SourcePath`,
							DestinationPath: `${prefix}-DestinationPath`,
						}
					}
				}
			]
		},
		SubscriptionDefinitionVersion: {
			Subscriptions: [
				{
					Id: `${prefix}-Id`,
					Source: `${prefix}-Source`,
					Subject: `${prefix}-Subject`,
					Target: `${prefix}-Target`,
				}
			]
		}
	}
}
