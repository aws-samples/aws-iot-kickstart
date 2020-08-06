import * as AWS from 'aws-sdk'
import * as _ from 'underscore'

const documentClient = new AWS.DynamoDB.DocumentClient()

const lib = 'getDeviceStats'

export function getDeviceStatsRecursive (lastEvalKey) {
	let params = {
		TableName: process.env.TABLE_DEVICES,
		Limit: 75,
	}

	if (lastEvalKey) {
		params.ExclusiveStartKey = lastEvalKey
	}

	params.ProjectionExpression = 'thingId, userId, deviceTypeId, connectionState, deviceBlueprintId'

	return documentClient.scan(params).promise().then(results => {
		let _stats = _.countBy(results.Items, (device) => {
			return device.connectionState.state
		})

		if (!_stats.hasOwnProperty('connected')) {
			_stats.connected = 0
		}

		if (!_stats.hasOwnProperty('disconnected')) {
			_stats.disconnected = 0
		}
		_stats.total = results.Items.length

		if (results.LastEvaluatedKey) {
			// @ts-ignore
			return getDeviceStatsRecursive(result.LastEvaluatedKey).then(data => {
				_stats.connected += data.connected
				_stats.disconnected += data.disconnected
				_stats.total += data.total

				return _stats
			})
		} else {
			return _stats
		}
	})
}

export function getDeviceStats (event, context) {
	return getDeviceStatsRecursive()
}

export default getDeviceStats
