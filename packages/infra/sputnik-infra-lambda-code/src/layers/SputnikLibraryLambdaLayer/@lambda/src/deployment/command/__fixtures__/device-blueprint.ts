import { DeviceBlueprint } from '@deathstar/sputnik-core-api'
import { DEVICE_TYPE_1 } from './device-type'

export const DEVICE_BLUEPRINT_1: DeviceBlueprint = {
	id: 'device-blueprint-1',
	name: 'Device Blueprint 1',
	type: 'GREENGRASS',
	compatibility: [DEVICE_TYPE_1.id],
	createdAt: (new Date()).toISOString(),
	updatedAt: (new Date()).toISOString(),
	spec: {
		ResourceDefinitionVersion: {
			Resources: [],
		},
		ConnectorDefinitionVersion: {
			Connectors: [
				{
					ConnectorArn: 'arn:aws:greengrass:ap-southeast-1::/connectors/DockerApplicationDeployment/versions/4',
					Parameters: {
						DockerComposeFileS3Version: 'null',
						ForceDeploy: 'True',
						DockerComposeFileS3Bucket: 'devproto-docker-deployment-118513466446-ap-southeast-1',
						DockerContainerStatusLogFrequency: '30',
						AWSSecretsArnList: '["arn:aws:secretsmanager:ap-southeast-1:118513466446:secret:DevProto-DockerhubCredentialsSecret-ap-southeast-1-rgnodR"]',
						DockerComposeFileS3Key: 'deploy-test/docker-compose-gm-stack.yml',
						DockerComposeFileDestinationPath: '/opt/device-provisioning/docker',
					},
					Id: 'DockerTestConnectorWithDH',
				},
			],
		},
	},
}
