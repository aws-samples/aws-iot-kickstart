'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
const S3Helper = require('./lib/s3-helper.js');

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
        sendResponse(event, callback, context.logStreamName, 'SUCCESS');
    }

    if (event.RequestType === 'Create' || event.RequestType === 'Update') {

        if (event.ResourceProperties.customAction === 'putFile') {
            let _s3Helper = new S3Helper();
            console.log(event.ResourceProperties.file);
            _s3Helper.putFile(event.ResourceProperties.varName, event.ResourceProperties.file, event.ResourceProperties.destS3Bucket, event.ResourceProperties.destS3Key).then((data) => {
                responseStatus = 'SUCCESS';
                responseData = data;
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }).catch((err) => {
                responseData = {
                    Error: `Saving file to ${event.ResourceProperties.destS3Bucket}/${event.ResourceProperties.destS3key} failed`
                };
                console.log([responseData.Error, ':\n', err].join(''));
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });

        } else if (event.ResourceProperties.customAction === 'copyS3assets') {
            let _s3Helper = new S3Helper();

            _s3Helper.copyAssets(event.ResourceProperties.sourceS3Bucket, event.ResourceProperties.sourceS3Key, event.ResourceProperties.destS3Bucket).then((data) => {
                responseStatus = 'SUCCESS';
                responseData = {};
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }).catch((err) => {
                responseData = {
                    Error: `Copy of website assets failed`
                };
                console.log([responseData.Error, ':\n', err].join(''));
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });

        } else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
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
