/*********************************************************************************************************************
 *  Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author tcruse@
 */

 'use strict';

const https = require('https');
const AWS = require('aws-sdk');
const moment = require('moment');
const documentClient = new AWS.DynamoDB.DocumentClient();

// Metrics class for sending usage metrics to sb endpoints
class Metrics {

    constructor() {
        this.endpoint = 'metrics.awssolutionsbuilder.com';
    }

    sendAnonymousMetric(metric) {

        return new Promise((resolve, reject) => {

            let _options = {
                hostname: this.endpoint,
                port: 443,
                path: '/generic',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            let request = https.request(_options, function(response) {
                // data is streamed in chunks from the server
                // so we have to handle the "data" event
                let buffer;
                let data;
                let route;

                response.on('data', function(chunk) {
                    buffer += chunk;
                });

                response.on('end', function(err) {
                    resolve('metric sent');
                });
            });

            if (metric) {
                metric.Solution = 'SO0053';
                request.write(JSON.stringify(metric));
            }

            request.end();

            request.on('error', (e) => {
                console.error(e);
                reject(['Error occurred when sending metric request.', JSON.stringify(e)].join(' '));
            });
        });

    }

    sendAnonymousMetricIfCustomerEnabled(metric) {
        return documentClient.get({
            TableName: process.env.TABLE_SETTINGS,
            Key: {
                id: 'app-config'
            }
        }).promise().then(result => {
            console.log('sendAnonymousMetricIfCustomerEnabled.settings:', result);
            if (result.Item && result.Item.setting && result.Item.setting.anonymousData === 'Yes' && result.Item.setting.uuid) {
                metric.UUID = result.Item.setting.uuid;
                metric.TimeStamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.S');
                return this.sendAnonymousMetric(metric).then(data => {
                    console.log('sendAnonymousMetricIfCustomerEnabled:', data);
                    return true;
                }).catch(err => {
                    console.error('ERROR', err);
                    return false;
                });
            } else {
                return false;
            }
        });
    }
}

module.exports = Metrics;
