import { Iot, IotData } from 'aws-sdk'

const iot = new Iot()

export async function updateIoTDeviceShadow (thingName: string, state: any) {
	const endpoint = await iot.describeEndpoint().promise()

	const iotdata = new IotData({
		endpoint: endpoint.endpointAddress,
	})

	// TODO: original sputnik updated empty and delete shadow before updating it... why?
	// await iotdata.updateThingShadow({
	// 	thingName,
	// 	payload: JSON.stringify({
	// 		state: {},
	// 	}),
	// }).promise()

	// await iotdata.deleteThingShadow({
	// 	thingName,
	// }).promise()

	await iotdata.updateThingShadow({
		thingName,
		payload: JSON.stringify({
			state,
		}),
	}).promise()
}


export async function getIoTPrincipals (thingName: string): Promise<string[]> {
	const { principals } = await iot.listThingPrincipals({
		thingName: thingName,
	}).promise()


	if (principals.length === 0) {
		throw new Error('Device does not yet have a certificate. Need to create one first.')
	}

	return principals
}
