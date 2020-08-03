import { AWS } from 'aws-sdk'
import moment from 'moment'
import _ from 'underscore'
import uuid from 'uuid'
import { DEFAULT_NAMESPACE as CORE_DEFAULT_NAMESPACE, mergeSpecs, substituteSpec, extractDeviceMappingSubstitutions } from '@deathstar/sputnik-core'
import { SpecDefinition, Device, DeviceBlueprint, DeviceType } from '@deathstar/sputnik-core-api'
import { EnvironmentVariables } from '../environment'
// import createGreengrassXDefinitionVersion from '../createGreengrassXDefinitionVersion'
// import mergeSputnikSpecs from '../merge-sputnik-specs'
// import mergeSputnikShadows from '../merge-sputnik-shadows'

const {
	AWS_ACCOUNT,
	AWS_REGION,
	DEFAULT_NAMESPACE = CORE_DEFAULT_NAMESPACE,
	TABLE_DEVICES,
	TABLE_DEVICE_TYPES,
	TABLE_DEVICE_BLUEPRINTS,
	TABLE_DEPLOYMENTS,
	DATA_BUCKET,
	IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS,
	IOT_POLICY_GREENGRASS_CORE,
	IOT_ENDPOINT,
} = process.env as unknown as EnvironmentVariables

const iot = new AWS.Iot()
// const iotdata = new AWS.IotData();
const documentClient = new AWS.DynamoDB.DocumentClient()
const gg = new AWS.Greengrass()

export const ADD_DEPLOYMENT_CMD = 'addDeployment'

async function getDevice (thingId: string): Promise<Device> {
	return documentClient.get({
		TableName: TABLE_DEVICES,
		Key: {
			thingId: thingId,
		},
	}).promise()
}

async function getDeviceType (deviceTypeId: string): Promise<DeviceType> {
	return documentClient.get({
		TableName: TABLE_DEVICE_TYPES,
		Key: {
			id: deviceTypeId,
		},
	}).promise()
}

async function getDeviceBlueprint (deviceBlueprintId: string): Promise<DeviceBlueprint> {
	return documentClient.get({
		TableName: TABLE_DEVICE_BLUEPRINTS,
		Key: {
			id: deviceBlueprintId,
		},
	}).promise()
}

async function getPrincipals (thingName: string): Promise<string[]> {
	const { principals } = iot.listThingPrincipals({
		thingName: thingName,
	}).promise()


	if (principals.length === 0) {
		throw new Error('Device does not yet have a certificate. Need to create one first.')
	}

	return principals
}

function interpolateSubstitutions (device: Device, certificateArn: string) {
	return {
		AWS_ACCOUNT,
		AWS_REGION,
		THING_NAME: device.thingName,
		CORE: device.thingName,
		CORE_ARN: device.thingArn,
		CORE_CERTIFICATE_ARN: certificateArn,
		DATA_BUCKET,
		IOT_ENDPOINT,
		DATA_BUCKET_S3_URL: `https://${DATA_BUCKET}.s3.amazonaws.com`,
		NAMESPACE: device.namespace || DEFAULT_NAMESPACE,
		DEFAULT_NAMESPACE,
	}
}

export async function ___addDeployment (event) {
	const device = await getDevice(event.thingId)
	const [deviceType, deviceBlueprint] = await Promise.all([
		getDeviceType(device.deviceTypeId),
		getDeviceBlueprint(device.deviceBlueprintId),
	])

	console.log('Device:', device)
	console.log('Device Type:', deviceType)
	console.log('Device Blueprint:', deviceBlueprint)

	if (deviceType == null || deviceBlueprint == null) {
		throw new Error('Device Type or Device Blueprint do not exist in DB')
	}

	const principals = await getPrincipals(device.thingName)
	const certificateArn = principals[0]

	// subsequent specs override previous, order is important
	// deviceType < deviceBlueprint < device
	const specs: SpecDefinition[] = []

	if (deviceType.spec) {
		console.log(`DeviceType Spec: ${JSON.stringify(deviceType.spec, null, 4)}`)
		specs.push(deviceType.spec)
	}

	if (deviceBlueprint.spec) {
		console.log(`DeviceBlueprint Spec: ${JSON.stringify(deviceBlueprint.spec, null, 4)}`)
		specs.push(deviceBlueprint.spec)
	}

	if (device.spec) {
		console.log(`Device Spec: ${JSON.stringify(device.spec, null, 4)}`)
		specs.push(device.spec)
	}

	// merge specs
	let spec = mergeSpecs(...specs)

	// get base substitutions
	const substitutions = interpolateSubstitutions(device, certificateArn)
	// include device mapping substitutions
	Object.assign(substitutions, extractDeviceMappingSubstitutions(device.deviceTypeId, deviceBlueprint.deviceTypeMappings))
	// apply all substitutions to spec
	spec = substituteSpec(spec, substitutions)
}

module.exports = function (event, context) {

	// 	return iot.listThingPrincipals({
	// 		thingName: _device.thingName,
	// 	}).promise()
	// }).then(principals => {
	// 	principals = principals.principals

	// 	if (principals.length === 0) {
	// 		throw 'Device does not yet have a certificate. Need to create one first.'
	// 	}

		// _certificateArn = principals[0]


		// Order is important
		// Merge Device into DeviceType into DeviceBlueprint
		// _newSpec = {}
		// _newShadow = {}

		// if (_device.spec) {
		// 	console.log(`Device Spec: ${JSON.stringify(_device.spec, null, 4)}`)
		// 	_newSpec = mergeSputnikSpecs(_newSpec, _device.spec)
		// 	_newShadow = mergeSputnikShadows(_newShadow, _device.spec.Shadow)
		// 	console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`)
		// }

		// if (_deviceType.spec) {
		// 	console.log(`Device Type Spec: ${JSON.stringify(_deviceType.spec, null, 4)}`)
		// 	_newSpec = mergeSputnikSpecs(_newSpec, _deviceType.spec)
		// 	_newShadow = mergeSputnikShadows(_newShadow, _deviceType.spec.Shadow)
		// 	console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`)
		// }

		// if (_deviceBlueprint.spec) {
		// 	console.log(`Device Blueprint Spec: ${JSON.stringify(_deviceBlueprint.spec, null, 4)}`)
		// 	_newSpec = mergeSputnikSpecs(_newSpec, _deviceBlueprint.spec)
		// 	_newShadow = mergeSputnikShadows(_newShadow, _deviceBlueprint.spec.Shadow)
		// 	console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`)
		// }

		// console.log('Deal with actions');
		// _newSpec.afterActions = [...(_device.spec.afterActions || []), ...(_deviceType.spec.afterActions || []), ...(_deviceBlueprint.spec.afterActions || [])];

		// console.log('Going to substitute in the spec')
		// // Construct the spec:
		// let strSpec = JSON.stringify(_newSpec)
		// let strShadow = JSON.stringify(_newShadow)
		// for (var key in _substitutions) {
		// 	// skip loop if the property is from prototype
		// 	if (!_substitutions.hasOwnProperty(key)) {
		// 		continue
		// 	}

		// 	var value = _substitutions[key]
		// 	for (var prop in value) {
		// 		// skip loop if the property is from prototype
		// 		if (!value.hasOwnProperty(prop)) {
		// 			continue
		// 		}

		// 		// your code
		// 		let regExp = new RegExp('[' + key + ']', 'gi')
		// 		strSpec = strSpec.split('[' + key + ']').join(value)
		// 		strShadow = strShadow.split('[' + key + ']').join(value)
		// 	}
		// }

		// TODO: Replace this with the !GetAtt system ?
		// _deviceBlueprint.deviceTypeMappings.forEach(mapping => {
		// 	if (mapping.value[_deviceType.id]) {
		// 		let regExp = new RegExp('[' + mapping.substitute + ']', 'gi')

		// 		let value = mapping.value[_deviceType.id]

		// 		if (typeof value === 'object') {
		// 			value = JSON.stringify(value).split('"').join('\\"')
		// 		}

		// 		strSpec = strSpec.split('[' + mapping.substitute + ']').join(value)
		// 	}
		// })

		// _newSpec = JSON.parse(strSpec)

		// _newShadow = JSON.parse(strShadow)
		// _newSpec.Shadow = _newShadow

		// // TODO: this eval thing could be a security risk. Need to potentially rethink this.
		// _newSpec.afterActions.forEach(a => {
		//     console.log('Evaluating:', a);
		//     eval(a);
		//     _newSpec = afterAction(_newSpec);
		// });

		console.log(`Spec out: ${JSON.stringify(_newSpec, null, 4)}`)

		if (_deviceType.type === 'GREENGRASS' && _deviceBlueprint.type === 'GREENGRASS') {
			console.log('Device is a Greengrass device:', _device.greengrassGroupId)

			return gg.getGroup({
				GroupId: _device.greengrassGroupId,
			}).promise().then(group => {
				if (!group.LatestVersion) {
					console.log('Group does not have a definition version yet. We will need to create it later down.')

					return null
				} else {
					return gg.getGroupVersion({
						GroupId: _device.greengrassGroupId,
						GroupVersionId: group.LatestVersion,
					}).promise()
				}
			}).then(groupDefinitionVersion => {
				_newGreengrassGroupVersion = {}
				_newGreengrassGroupVersion.GroupId = _device.greengrassGroupId

				return Promise.all([
					createGreengrassXDefinitionVersion('Core', _newSpec, groupDefinitionVersion).then(c => {
						if (c) {
							_newGreengrassGroupVersion.CoreDefinitionVersionArn = c.Arn
						}

						return c
					}),
					createGreengrassXDefinitionVersion('Function', _newSpec, groupDefinitionVersion).then(f => {
						if (f) {
							_newGreengrassGroupVersion.FunctionDefinitionVersionArn = f.Arn
						}

						return f
					}),
					createGreengrassXDefinitionVersion('Logger', _newSpec, groupDefinitionVersion).then(l => {
						if (l) {
							_newGreengrassGroupVersion.LoggerDefinitionVersionArn = l.Arn
						}

						return l
					}),
					createGreengrassXDefinitionVersion('Resource', _newSpec, groupDefinitionVersion).then(r => {
						if (r) {
							_newGreengrassGroupVersion.ResourceDefinitionVersionArn = r.Arn
						}

						return r
					}),
					createGreengrassXDefinitionVersion('Subscription', _newSpec, groupDefinitionVersion).then(s => {
						if (s) {
							_newGreengrassGroupVersion.SubscriptionDefinitionVersionArn = s.Arn
						}

						return s
					}),
					createGreengrassXDefinitionVersion('Device', _newSpec, groupDefinitionVersion).then(d => {
						if (d) {
							_newGreengrassGroupVersion.DeviceDefinitionVersionArn = d.Arn
						}

						return d
					}),
					createGreengrassXDefinitionVersion('Connector', _newSpec, groupDefinitionVersion).then(d => {
						if (d) {
							_newGreengrassGroupVersion.ConnectorDefinitionVersionArn = d.Arn
						}

						return d
					}),
				])
			}).then(results => {
				console.log('results', JSON.stringify(results))
				console.log('newGreengrassGroupVersion', JSON.stringify(_newGreengrassGroupVersion, null, 2))

				return gg.createGroupVersion(_newGreengrassGroupVersion).promise()
			}).then(groupVersion => {
				_groupVersion = groupVersion

				console.log(`Created group version: ${JSON.stringify(_groupVersion, null, 2)}`)

				console.log('Attach IAM role to group just in case')

				return gg.associateRoleToGroup({
					RoleArn: IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS,
					GroupId: _device.greengrassGroupId,
				}).promise()
			}).then(result => {
				console.log('Attach IOT Greengrass policy to group just in case')

				// TODO: this should ideally be in the specs!

				return iot
					.attachPrincipalPolicy({
						policyName: IOT_POLICY_GREENGRASS_CORE,
						principal: _certificateArn,
					})
					.promise()
			}).then(result => {
				console.log('Deploy group:')

				return gg.createDeployment({
					GroupId: _groupVersion.Id,
					DeploymentId: uuid.v4(),
					DeploymentType: 'NewDeployment',
					GroupVersionId: _groupVersion.Version,
				}).promise()
			}).then(deployment => {
				_deployment = deployment
				console.log(`Deployed: ${_deployment.DeploymentId}`)

				_savedDeployment = {
					thingId: _device.thingId,
					deploymentId: _deployment.DeploymentId,
					spec: _newSpec,
					type: 'GREENGRASS',
					greengrassGroup: {
						Id: _groupVersion.Id,
						VersionId: _groupVersion.Version,
					},
					createdAt: moment()
						.utc()
						.format(),
					updatedAt: moment()
						.utc()
						.format(),
				}

				return _savedDeployment
			})
		} else {
			console.log('Device is NOT a greengrass device, or at least not detected as one. OR the deviceBlueprint/deviceType combination is not for a Greengrass device')

			_savedDeployment = {
				thingId: _device.thingId,
				deploymentId: uuid.v4(),
				spec: _newSpec,
				type: _deviceType.type,
				greengrassGroup: {},
				createdAt: moment()
					.utc()
					.format(),
				updatedAt: moment()
					.utc()
					.format(),
			}

			return _savedDeployment
		}
	}).then(params => {
		const newDeployment = {
			TableName: TABLE_DEPLOYMENTS,
			Item: _savedDeployment,
		}

		return documentClient.put(newDeployment).promise()
	}).then(deployment => {
		const updateParams = {
			TableName: TABLE_DEVICES,
			Key: {
				thingId: _device.thingId,
			},
			UpdateExpression: 'set #ua = :ua, #l = :l',
			ExpressionAttributeNames: {
				'#ua': 'updatedAt',
				'#l': 'lastDeploymentId',
			},
			ExpressionAttributeValues: {
				':ua': moment()
					.utc()
					.format(),
				':l': _savedDeployment.deploymentId,
			},
		}

		return documentClient.update(updateParams).promise()
	}).then(device => {
		if (JSON.stringify(_newShadow) !== '{}') {
			return iot.describeEndpoint().promise().then(endpoint => {
				const iotdata = new AWS.IotData({
					endpoint: endpoint.endpointAddress,
				})

				return iotdata.updateThingShadow({
					thingName: _device.thingName,
					payload: JSON.stringify({
						state: {},
					}),
				}).promise().then(result => {
					console.log('Updating with nothing, to create in case it doesnt exist')

					return iotdata.deleteThingShadow({
						thingName: _device.thingName,
					}).promise().then(result => {
						return iotdata.updateThingShadow({
							thingName: _device.thingName,
							payload: JSON.stringify({
								state: _newShadow,
							}),
						}).promise()
					})
				})
			}).then(result => {
				console.log('Updated shadow per spec:', _newShadow)

				return _savedDeployment
			})
		} else {
			return _savedDeployment
		}
	}).then(() => {
		console.log('AND WE ARE DONE !')

		return _savedDeployment
	})
}
