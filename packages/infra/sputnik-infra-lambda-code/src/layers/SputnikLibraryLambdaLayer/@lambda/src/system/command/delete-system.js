const AWS = require('aws-sdk')

const documentClient = new AWS.DynamoDB.DocumentClient()

const lib = 'deleteSystem'

module.exports = function (event, context) {
	return documentClient.delete({
		TableName: process.env.TABLE_SYSTEMS,
		Key: {
			id: event.id,
		},
	}).promise()
}
