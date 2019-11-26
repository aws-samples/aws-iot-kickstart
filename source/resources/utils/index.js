'use strict';

console.log('Loading function');

const https = require('https');
const url = require('url');
const UUID = require('uuid');
const moment = require('moment');

const DDBHelper = require('./lib/dynamodb-helper');
const S3Helper = require('./lib/s3-helper');
const IOTHelper = require('./lib/iot-helper');
const GREENGRASSHelper = require('./lib/greengrass-helper');

const UsageMetrics = require('usage-metrics');


/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const ddbHelper = new DDBHelper();
    const s3Helper = new S3Helper();
    const iotHelper = new IOTHelper();
    const greengrassHelper = new GREENGRASSHelper();
    const usageMetrics = new UsageMetrics();

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete' || event.RequestType === 'Update' || event.RequestType === 'Create') {

        if (event.RequestType === 'Delete') {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        } else if (event.RequestType === 'Create' && event.ResourceProperties.customAction === 'createUUID') {
            responseStatus = 'SUCCESS';
            responseData = {
                UUID: UUID.v4()
            };

            if (event.ResourceProperties.anonymousData === 'Yes') {

                usageMetrics.sendAnonymousMetric({
                    UUID: responseData.UUID,
                    TimeStamp: moment()
                        .utc()
                        .format("YYYY-MM-DD HH:mm:ss.S"),
                    Data: {
                        Version: event.ResourceProperties.version,
                        Event: 'Launch'
                    }
                }).then(data => {
                    console.log("Annonymous metrics successfully sent.", data);
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch(err => {
                    responseData = {
                        Error: "Sending anonymous delete metric failed"
                    };
                    console.log([responseData.Error, ":\n", err].join(""));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

            } else {
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }
        } else if (event.RequestType === 'Create' || event.RequestType === 'Update') {
            if (event.ResourceProperties.customAction === 'dynamodbPutObjectsFromS3Folder') {
                ddbHelper.dynamodbPutObjectsFromS3Folder(event.ResourceProperties.sourceS3Bucket, event.ResourceProperties.sourceS3Key, event.ResourceProperties.table).then(data => {
                    responseStatus = 'SUCCESS';
                    responseData = data;
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch((err) => {
                    console.log('error');
                    responseData = {
                        Error: `dynamodbPutObjectsFromS3Folder failed`
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

            } else if (event.ResourceProperties.customAction === 'dynamodbSaveItem') {
                ddbHelper.dynamodbSaveItem(event.ResourceProperties.ddbItem, event.ResourceProperties.ddbTable).then(data => {
                    responseStatus = 'SUCCESS';
                    responseData = data;
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch((err) => {
                    responseData = {
                        Error: `Saving item to DyanmoDB table ${event.ResourceProperties.ddbTable} failed`
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

            } else if (event.ResourceProperties.customAction === 'copyFileFromS3ToS3') {
                s3Helper.copyFileFromS3ToS3(event.ResourceProperties.sourceS3Bucket, event.ResourceProperties.sourceS3Key, event.ResourceProperties.destS3Bucket, event.ResourceProperties.destS3Key).then(data => {
                    responseStatus = 'SUCCESS';
                    responseData = data;
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch(err => {
                    responseData = {
                        Error: `copyFileFromS3ToS3 failed`
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

            } else if (event.ResourceProperties.customAction === 'iotDescribeEndpoint') {
                iotHelper.describeEndpoint(event.ResourceProperties.endpointType).then(data => {
                    responseStatus = 'SUCCESS';
                    responseData = data;
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch(err => {
                    responseData = {
                        Error: `iotDescribeEndpoint failed`
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });
            } else if (event.ResourceProperties.customAction === 'greengrassAssociateServiceRoleToAccount') {
                greengrassHelper.associateServiceRoleToAccount().then(data => {
                        responseStatus = 'SUCCESS';
                        responseData = data;
                        sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch(err => {
                    responseData = {
                        Error: `greengrassAssociateServiceRoleToAccount failed`
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });
            } else {
                sendResponse(event, callback, context.logStreamName, 'SUCCESS');
            }
        }

    } else if (event.RequestType === 'Utils') {

        switch (event.cmd) {
            case 'attachPrincipalPolicy':
                iotHelper.attachPrincipalPolicy(event.policyName, event.principal).then(result => callback(null, result)).catch(err => callback(err, null));
                break;
            case 'blueprintParser':
                const BlueprintParser = require('./lib/blueprint-parser');
                const blueprintParser = new BlueprintParser();
                blueprintParser.parse(event.message).then(result => callback(null, result)).catch(err => callback(err, null));
                break;
            case 'describeEndpoint':
                iotHelper.describeEndpoint(event.endpointType).then(result => callback(null, result.endpointAddress)).catch(err => callback(err, null));
                break;
            case 'iotdata.deleteThingShadow':
            case 'iotdata.getThingShadow':
            case 'iotdata.publish':
            case 'iotdata.updateThingShadow':
                iotHelper.iotdata(event.cmd, event.params).then(result => callback(null, result)).catch(err => callback(err, null));
                break;
            case 's3.listObjectsV2':
                s3Helper.listObjectsV2(event.params).then(result => callback(null, result)).catch(err => callback(err, null));
                break;
            default:
                callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
                break;
        }

    }

};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function (event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};
