const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const s3 = new AWS.S3();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');
const UsageMetrics = require('usage-metrics');
const shortid = require('shortid');

const lib = 'addDevice';

module.exports = function(event, context) {
    const usageMetrics = new UsageMetrics();
    if (event.thingName === undefined) {
        event.thingName = `sputnik-${shortid.generate()}`;
    }
    const tag = `${lib}(${event.thingName}):`;

    console.log(tag, 'start');

    // Event needs to be:
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.name

    return iot
        .createThing({
            thingName: event.thingName
        })
        .promise()
        .catch(err => {
            if (err.code === 'ResourceAlreadyExistsException') {
                console.log(tag, 'Thing already exists.');
                return iot.describeThing({
                    thingName: event.thingName
                }).promise();
            } else {
                throw err;
            }
        })
        .then(thing => {
            console.log(tag, 'Created thing:', thing);
            event.thing = thing;

            // Create thing returns
            // {
            //     "thingArn": "arn:aws:iot:us-east-1:accountnumber:thing/foo",
            //     "thingName": "foo",
            //     "thingId": "ef17a1237-eb50-4d64-a359-df4894ba90a0"
            // }

            const params = {
                thingId: event.thing.thingId,
                thingName: event.thing.thingName,
                thingArn: event.thing.thingArn,
                name: event.name,
                deviceTypeId: event.deviceTypeId || 'UNKNOWN',
                deviceBlueprintId: event.deviceBlueprintId || 'UNKNOWN',
                greengrassGroupId: 'UNKNOWN',
                spec: {},
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
                        .format()
                }
            };

            return Promise.all([
                params,
                documentClient
                    .put({
                        TableName: process.env.TABLE_DEVICES,
                        Item: params,
                        ReturnValues: 'ALL_OLD'
                    })
                    .promise()
            ]);
        })
        .then(results => {
            console.log(tag, 'Created Device:', JSON.stringify(results, null, 4));
            return usageMetrics
                .sendAnonymousMetricIfCustomerEnabled({
                    metric: 'newDevice',
                    value: event.thing.thingId
                })
                .then(res => {
                    return results[0];
                });
        });
};
