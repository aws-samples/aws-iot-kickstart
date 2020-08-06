import * as AWS from 'aws-sdk'

const documentClient = new AWS.DynamoDB.DocumentClient()

const lib = 'deleteSystem'

export function deleteSystem (event, context) {
	return documentClient.delete({
		TableName: process.env.TABLE_SYSTEMS,
		Key: {
			id: event.id,
		},
	}).promise()
}

export default deleteSystem
