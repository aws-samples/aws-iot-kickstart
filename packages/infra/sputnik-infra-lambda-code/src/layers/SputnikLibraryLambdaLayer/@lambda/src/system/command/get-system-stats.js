import * as AWS from 'aws-sdk'
import * as _ from 'underscore'

const documentClient = new AWS.DynamoDB.DocumentClient()

const lib = 'getSystemStats'

export function getSystemStatsRecursive (lastEvalKey) {
	console.log(lib, lastEvalKey)

	let params = {
		TableName: process.env.TABLE_SYSTEMS,
		Limit: 75,
	}

	if (lastEvalKey) {
		params.ExclusiveStartKey = lastEvalKey
	}

	params.ProjectionExpression = 'id, thingId, systemBlueprintId'

	return documentClient.scan(params).promise().then(results => {
		console.log('scan', results.Items.length)
		let _stats = {
			total: results.Items.length,
		}

		if (results.LastEvaluatedKey) {
			// @ts-ignore
			return getSystemStatsRecursive(result.LastEvaluatedKey).then(data => {
				// _stats.connected += data.connected;
				// _stats.disconnected += data.disconnected;
				_stats.total += data.total

				return _stats
			})
		} else {
			return _stats
		}
	})
}

export function getSystemStats (event, context, callback) {
	return getSystemStatsRecursive()
}

export default getSystemStats
