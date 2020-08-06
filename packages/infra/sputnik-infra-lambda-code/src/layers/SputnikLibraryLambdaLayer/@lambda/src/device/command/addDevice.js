import { Iot, DynamoDB } from 'aws-sdk'
import { property, isString, omit } from 'underscore'
import * as moment from 'moment'
import UsageMetrics from '../../metrics/metrics.common'
import * as shortid from 'shortid'

const iot = new Iot()
const documentClient = new DynamoDB.DocumentClient()

const lib = 'addDevice'

function get (object, path) {
	return property(path.split('.'))(object)
}

function asObject (value, defaultValue = {}) {
	if (isString(value)) {
		return JSON.parse(value)
	}

	return value || defaultValue
}

export function addDevice (event, context) {
	const usageMetrics = new UsageMetrics()

	if (event.thingName === undefined) {
		event.thingName = `sputnik-${shortid.generate()}`
	}
	const tag = `${lib}(${event.thingName}):`

	console.log(tag, 'start')

	// Event needs to be:
	// event.deviceTypeId
	// event.deviceBlueprintId
	// event.name

	return iot
		.createThing({
			thingName: event.thingName,
		})
		.promise()
		.catch(err => {
			if (err.code === 'ResourceAlreadyExistsException') {
				console.log(tag, 'Thing already exists.')

				return iot.describeThing({
					thingName: event.thingName,
				}).promise()
			} else {
				throw err
			}
		})
		.then(thing => {
			console.log(tag, 'Created thing:', thing)
			event.thing = thing

			// Create thing returns
			// {
			//     "thingArn": "arn:aws:iot:us-east-1:accountnumber:thing/foo",
			//     "thingName": "foo",
			//     "thingId": "ef17a1237-eb50-4d64-a359-df4894ba90a0"
			// }

			console.log(tag, 'CreateThingEvent:', event)

			const params = {
				thingId: event.thing.thingId,
				thingName: event.thing.thingName,
				thingArn: event.thing.thingArn,
				name: event.name,
				deviceTypeId: event.deviceTypeId || get(event, 'thing.attributes.deviceTypeId') || 'UNKNOWN',
				deviceBlueprintId: event.deviceBlueprintId || get(event, 'thing.attributes.deviceBlueprintId') || 'UNKNOWN',
				greengrassGroupId: event.greengrassGroupId || get(event, 'thing.attributes.greengrassGroupId') || 'UNKNOWN',
				spec: asObject(event.spec, null) || get(event, 'thing.attributes.spec'),
				// Extract all unspecified thing.attributes into `metadata` map property
				metadata: asObject(event.metadata, null) || omit(get(event, 'thing.attributes') || {}, 'deviceTypeId', 'deviceBlueprintId', 'greengrassGroupId', 'spec'),
				lastDeploymentId: 'UNKNOWN',
				createdAt: moment()
					.utc()
					.format(),
				updatedAt: moment()
					.utc()
					.format(),
				certificateArn: 'NOTSET',
				connectionState: {
					state: 'created',
					at: moment(0)
						.utc()
						.format(),
				},
			}

			return Promise.all([
				params,
				documentClient
					.put({
						TableName: process.env.TABLE_DEVICES,
						Item: params,
						ReturnValues: 'ALL_OLD',
					})
					.promise(),
			])
		})
		.then(results => {
			console.log(tag, 'Created Device:', JSON.stringify(results, null, 4))

			return usageMetrics
				.sendAnonymousMetricIfCustomerEnabled({
					metric: 'newDevice',
					value: event.thing.thingId,
				})
				.then(res => {
					return results[0]
				})
		})
}

export default addDevice
