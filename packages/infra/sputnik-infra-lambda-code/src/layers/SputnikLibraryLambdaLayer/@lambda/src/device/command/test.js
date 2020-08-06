import * as AWS from 'aws-sdk'

const documentClient = new AWS.DynamoDB.DocumentClient()

export function test (event, context) {
	return documentClient.query({
		TableName: process.env.TABLE_DEVICES,
		// @ts-ignore
		Index: 'deviceBlueprintId',
		KeyConditionExpression: 'deviceBlueprintId = :deviceBlueprintId',
		ExpressionAttributeValues: {
			':deviceBlueprintId': 'aws-afr-3d-belt-mini-connected-factory-v1.0',
		},
	}).promise().then(data => {
		console.log(data)
	})
}

export default test
