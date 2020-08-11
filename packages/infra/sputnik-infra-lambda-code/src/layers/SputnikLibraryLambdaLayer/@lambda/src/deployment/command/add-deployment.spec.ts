// import * as AWSMock from 'aws-sdk-mock'
import { ListThingPrincipalsRequest, ListThingPrincipalsResponse } from 'aws-sdk/clients/iot'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import * as Greengrass from 'aws-sdk/clients/greengrass'
import * as FIXTURE from './__fixtures__'

interface WithPromiseReponse<T> {
	promise: () => T
}

jest.mock('aws-sdk', () => {
	function withPromise<T> (result: T): WithPromiseReponse<T> {
		return {
			promise: () => result,
		}
	}

	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (params: DynamoDB.GetItemInput) => {
					switch (params.TableName) {
						case 'Device': {
							return withPromise({
								Item: FIXTURE.DEVICE_1,
							})
						}
						case 'DeviceType': {
							return withPromise({
								Item: FIXTURE.DEVICE_TYPE_1,
							})
						}
						case 'DeviceBlueprint': {
							return withPromise({
								Item: FIXTURE.DEVICE_BLUEPRINT_1,
							})
						}
						default: {
							throw new Error(`TableName "${params.TableName}" is not mocked`)
						}
					}
				},
				put: (params: DynamoDB.PutItemInput) => {
					return withPromise<DynamoDB.PutItemOutput>({})
				},
				update: (params: DynamoDB.UpdateItemInput) => {
					return withPromise<DynamoDB.UpdateItemOutput>({})
				},
			})),
		},
		Iot: jest.fn(() => ({
			listThingPrincipals: (params: ListThingPrincipalsRequest) => {
				return withPromise<ListThingPrincipalsResponse>({
					principals: ['mock-principal'],
				})
			},
		})),
		Greengrass: jest.fn(() => ({
			getGroup: (params: Greengrass.GetGroupRequest) => {
				return withPromise<Greengrass.GetGroupResponse>({
					Arn: `${params.GroupId}-gg-arn`,
					Id: params.GroupId,
					// LatestVersion: `${params.GroupId}-gg-latest-version`,
					// LatestVersionArn: `${params.GroupId}-gg-latest-version-arn`
				})
			},
			getGroupVersion: (params: Greengrass.GetGroupVersionRequest) => {
				return withPromise<Greengrass.GetGroupVersionResponse>({
					Arn: `${params.GroupId}-gg-arn`,
					Id: params.GroupId,
				})
			},
			createGroupVersion: (params: Greengrass.CreateGroupVersionRequest) => {
				return withPromise<Greengrass.CreateGroupVersionResponse>({
					Arn: `${params.GroupId}-gg-arn`,
					Id: params.GroupId,
					Version: 'gg-version',
				})
			},
			createDeployment: (params: Greengrass.CreateDeploymentRequest) => {
				return withPromise<Greengrass.CreateDeploymentResponse>({
					DeploymentArn: 'gg-deployment-arn',
					DeploymentId: params.DeploymentId,
				})
			},
			...[
				'createCoreDefinition', 'createLoggerDefinition', 'createFunctionDefinition', 'createSubscriptionDefinition',
				'createResourceDefinition', 'createConnectorDefinition',
			].reduce((methods, key) => {
				return {
					...methods,
					[key]: (params: Greengrass.CreateCoreDefinitionRequest) => {
						return withPromise<Greengrass.CreateCoreDefinitionResponse>({
							Arn: `${key}-arn`,
							Id: `${key}-id`,
							LatestVersion: `${key}-latest-version`,
							LatestVersionArn: `${key}-latest-version-arn`,
						})
					},
				}
			}, {}),
			...[
				'createCoreDefinitionVersion', 'createLoggerDefinitionVersion', 'createFunctionDefinitionVersion', 'createSubscriptionDefinitionVersion',
				'createResourceDefinitionVersion', 'createConnectorDefinitionVersion',
			].reduce((methods, key) => {
				return {
					...methods,
					[key]: (params: Greengrass.CreateCoreDefinitionVersionRequest) => {
						return withPromise<Greengrass.CreateCoreDefinitionVersionResponse>({
							Arn: `${key}-arn`,
							Id: `${key}-id`,
							Version: `${key}-version`,
						})
					},
				}
			}, {}),
			...[
				'getCoreDefinition', 'getLoggerDefinition', 'getFunctionDefinition', 'getSubscriptionDefinition',
				'getResourceDefinition', 'getConnectorDefinition',
			].reduce((methods, key) => {
				return {
					...methods,
					[key]: (params: Greengrass.GetCoreDefinitionRequest) => {
						return withPromise<Greengrass.GetCoreDefinitionResponse>({
							Arn: `${key}-arn`,
							Id: `${key}-id`,
							LatestVersion: `${key}-latest-version`,
							LatestVersionArn: `${key}-latest-version-arn`,
						})
					},
				}
			}, {}),
			...[
				'getCoreDefinitionVersion', 'getLoggerDefinitionVersion', 'getFunctionDefinitionVersion', 'getSubscriptionDefinitionVersion',
				'getResourceDefinitionVersion', 'getConnectorDefinitionVersion',
			].reduce((methods, key) => {
				return {
					...methods,
					[key]: (params: Greengrass.GetCoreDefinitionVersionRequest) => {
						return withPromise<Greengrass.GetCoreDefinitionVersionResponse>({
							Arn: `${key}-arn`,
							Id: `${key}-id`,
							Version: `${key}-version`,
						})
					},
				}
			}, {}),
		})),
	}
})

// TODO: move this to global
type JestExpect = <R>(actual: R) => jest.Matchers<R> & jasmine.Matchers<R>;
declare const expect: JestExpect

describe('deployment/command/add-deployment', () => {
	describe('addDeployment', () => {
		test('should deploy single device', async () => {
			const { addDeployment } = require('./add-deployment')

			const deployment = await addDeployment('device-thing-1')

			expect(deployment).toBeDefined()
		}, 10000)
	})
})

beforeEach(async (done) => {
	jest.resetModules()

	Object.assign(process.env, {
		AWS_ACCOUNT: '1111111111',
		AWS_REGION: 'ap-southeast-1',
		DEFAULT_NAMESPACE: 'default',
		TABLE_DEVICES: 'Device',
		TABLE_DEVICE_TYPES: 'DeviceType',
		TABLE_DEVICE_BLUEPRINTS: 'DeviceBlueprint',
		TABLE_DEPLOYMENTS: 'Deployment',
		DATA_BUCKET: 'data-bucket',
		IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: 'greengrass-groups-role',
		IOT_POLICY_GREENGRASS_CORE: 'iot-policy-greengrass-core',
		IOT_ENDPOINT: 'https://iot-endpoint.test',
	})

	done()
})
