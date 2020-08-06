import * as AWS from 'aws-sdk'
import * as _ from 'underscore'

const iot = new AWS.Iot()
const gg = new AWS.Greengrass()
const documentClient = new AWS.DynamoDB.DocumentClient()

const lib = 'deleteDevice'

// Deletes a sputnik device.
// Inputs:
// .thingId: device identified by thingId to delete

export function deleteDevice (event, context) {
	const tag = `${lib}(${event.thingId}):`

	return documentClient
		.get({
			TableName: process.env.TABLE_DEVICES,
			Key: {
				thingId: event.thingId,
			},
		})
		.promise()
		.then(device => {
			if (!device.Item) {
				console.error(tag, 'Device requested does not exist in Sputnik:', event.thingId)
				throw {
					error: 404,
					message: 'Device ' + event.thingId + ' does not exist.',
				}
			}

			event.device = device.Item
			console.log(tag, 'Device to delete:', event.device)

			return iot.describeThing({
				thingName: event.device.thingName,
			}).promise().then(thing => {
				return iot
					.listThingPrincipals({
						thingName: event.device.thingName,
					})
					.promise()
					.then(principals => {
						// @ts-ignore
						principals = principals.principals
						// @ts-ignore
						console.log(tag, 'Found', principals.length, 'certificates to be deleted.')

						return Promise.all(
							// @ts-ignore
							principals.map(principalArn => {
								return iot
									.listPrincipalPolicies({
										principal: principalArn,
									})
									.promise()
									.then(policies => {
										// @ts-ignore
										policies = policies.policies
										console.log(
											tag,
											'Found',
											// @ts-ignore
											policies.length,
											'policies to be detached.'
										)

										return Promise.all(
											// @ts-ignore
											policies.map(policy => {
												console.log(
													tag,
													'Detaching',
													policy.policyName,
													'from certificate',
													principalArn
												)

												return iot
													.detachPrincipalPolicy({
														policyName: policy.policyName,
														principal: principalArn,
													})
													.promise()
											})
										).then(detachedPolicies => {
											console.log(
												tag,
												'Detaching',
												event.device.thingName,
												'from certificate',
												principalArn
											)

											return iot
												.detachThingPrincipal({
													thingName: event.device.thingName,
													principal: principalArn,
												})
												.promise()
										})
									})
									.then(result => {
										console.log(tag, 'Making the certificate Inactive')

										return iot
											.updateCertificate({
												certificateId: principalArn.split('/')[1],
												newStatus: 'INACTIVE',
											})
											.promise()
									})
									.then(result => {
										console.log(tag, 'Deleting certificate', principalArn)

										return iot
											.deleteCertificate({
												certificateId: principalArn.split('/')[1],
											})
											.promise()
									})
							})
						)
					})
					.then(result => {
						// At this point, thing is ready to be deleted
						console.log(tag, 'Done with the certificate')

						if (
							event.device.greengrassGroupId !== 'NOT_A_GREENGRASS_DEVICE' &&
                            event.device.greengrassGroupId !== 'UNKNOWN'
						) {
							console.log(
								tag,
								'Device was a Greengrass group. Lets clean it up.',
								event.device.greengrassGroupId
							)
							console.log(tag, 'Reseting the deployments')

							return gg
								.resetDeployments({
									GroupId: event.device.greengrassGroupId,
									Force: true,
								})
								.promise()
								.then(result => {
									console.log(tag, 'Deleting the group')

									return gg
										.deleteGroup({
											GroupId: event.device.greengrassGroupId,
										})
										.promise()
								})
						} else {

						}
					})
					.then(result => {
						return iot
							.deleteThing({
								thingName: event.device.thingName,
							})
							.promise()
					}).then(thing => {
						console.log(tag, 'Deleted the thing.')
					})
			}).catch(err => {
				// This is the use case for which we've created the device in sputnik, but the thing does not exist.

			})
		})
		.then(() => {
			console.log(tag, 'Deleting the device.')

			return documentClient
				.delete({
					TableName: process.env.TABLE_DEVICES,
					Key: {
						thingId: event.thingId,
					},
				})
				.promise()
		})
		.then(results => {
			console.log(tag, 'We are done. Lets return the device')

			return event.device
		})
}

export default deleteDevice
