import { DeviceType } from '@deathstar/sputnik-core-api'

export const DEVICE_TYPE_1: DeviceType = {
	id: 'device-type-1',
	name: 'Device Type 1',
	type: 'GREENGRASS',
	createdAt: (new Date()).toISOString(),
	updatedAt: (new Date()).toISOString(),
	spec: {
		CoreDefinitionVersion: {
			Cores: [
				{
					SyncShadow: true,
					ThingArn: '[CORE_ARN]',
					CertificateArn: '[CORE_CERTIFICATE_ARN]',
				},
			],
		},
		LoggerDefinitionVersion: {
			Loggers: [
				{
					Type: 'AWSCloudWatch',
					Level: 'INFO',
					Component: 'GreengrassSystem',
				},
				{
					Type: 'AWSCloudWatch',
					Level: 'INFO',
					Component: 'Lambda',
				},
				{
					Space: 300000,
					Type: 'FileSystem',
					Level: 'INFO',
					Component: 'GreengrassSystem',
				},
				{
					Space: 300000,
					Type: 'FileSystem',
					Level: 'INFO',
					Component: 'Lambda',
				},
			],
		},
		FunctionDefinitionVersion: {
			Functions: [],
		},
		SubscriptionDefinitionVersion: {
			Subscriptions: [],
		},
	},
}
