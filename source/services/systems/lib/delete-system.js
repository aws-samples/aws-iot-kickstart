const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteSystem';

module.exports = function (event, context) {

    return documentClient.delete({
        TableName: process.env.TABLE_SYSTEMS,
        Key: {
            id: event.id
        }
    }).promise();

};
