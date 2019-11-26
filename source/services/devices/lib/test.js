const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamoDB = new AWS.DynamoDB();
const _ = require('underscore');

module.exports = function (event, context) {
    return documentClient.query({
        TableName: process.env.TABLE_DEVICES,
        Index: 'deviceBlueprintId',
        KeyConditionExpression: 'deviceBlueprintId = :deviceBlueprintId',
        ExpressionAttributeValues: {
            ':deviceBlueprintId': 'aws-afr-3d-belt-mini-connected-factory-v1.0'
        }
    }).promise().then(data => {
        console.log(data);
    });
};
