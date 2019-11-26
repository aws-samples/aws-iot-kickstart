'use strict';

let AWS = require('aws-sdk');
const fs = require('fs');
const moment = require('moment');

/**
 * Helper function to interact with AWS S3 for cfn custom resource.
 *
 * @class dynamodbHelper
 */
class dynamodbHelper {

    /**
     * @class dynamodbHelper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    dynamodbPutObjectsFromS3Folder(sourceS3Bucket, sourceS3Prefix, table) {
        console.log(`source bucket: ${sourceS3Bucket}`);
        console.log(`source prefix: ${sourceS3Prefix}`);
        console.log(`ddb table: ${table}`);

        const s3 = new AWS.S3();
        const documentClient = new AWS.DynamoDB.DocumentClient();

        let _self = this;

        function _listAllFiles(allFiles, token) {
            let opts = {
                Bucket: sourceS3Bucket,
                Prefix: sourceS3Prefix
            };
            if (token) {
                opts.ContinuationToken = token;
            }

            return s3.listObjectsV2(opts).promise().then(data => {
                allFiles = allFiles.concat(data.Contents.map((e) => {
                    return e.Key.split(sourceS3Prefix + '/').pop();
                }));
                if (data.IsTruncated) {
                    return _listAllFiles(allFiles, data.NextContinuationToken);
                } else
                    return allFiles;
            });
        }

        return _listAllFiles([], null).then(files => {
            console.log('Found:', JSON.stringify(files));

            files = files.filter(file => {
                return file.indexOf('.json') > 0;
            });

            return files.reduce((previousValue, currentValue, index, array) => {
                return previousValue.then(chainResults => {

                    console.log('Getting:', currentValue);

                    return s3.getObject({
                        Bucket: sourceS3Bucket,
                        Key: sourceS3Prefix + '/' + currentValue
                    }).promise().then(data => {

                        const params = {
                            TableName: table,
                            Item: JSON.parse(data.Body.toString('ascii'))
                        };

                        params.Item.createdAt = moment()
                            .utc()
                            .format();
                        params.Item.updatedAt = moment()
                            .utc()
                            .format();

                        console.log('Putting:', currentValue, params);

                        return documentClient.put(params).promise();

                    }).then(result => {

                        console.log('Put file', currentValue, 'in db');

                        return [...chainResults, {
                            file: currentValue
                        }];

                    }).catch(err => {
                        console.error('ERROR: failed to write', currentValue, 'to DB', JSON.stringify(err));
                        throw err;
                    });
                });
            }, Promise.resolve([]).then(arrayOfResults => arrayOfResults));


            // return Promise.all(files.map(file => {

            //     console.log('Getting:', file);

            //     return s3.getObject({
            //         Bucket: sourceS3Bucket,
            //         Key: sourceS3Prefix + '/' + file
            //     }).promise().then(data => {

            //         const params = {
            //             TableName: table,
            //             Item: JSON.parse(data.Body.toString('ascii')),
            //             ReturnValues: 'ALL_OLD'
            //         };

            //         params.Item.createdAt = moment()
            //             .utc()
            //             .format();
            //         params.Item.updatedAt = moment()
            //             .utc()
            //             .format();

            //         console.log(file, params);

            //         return documentClient.put(params).promise();

            //     }).then(result => {
            //         console.log('Put file', file, 'in db', result);
            //         return {
            //             file: file
            //         };
            //     }).catch(err => {
            //         console.error('ERROR: failed to write', file, 'to DB', JSON.stringify(err));
            //         throw err;
            //     });
            // }));

        }).then(results => {
            return {
                result: results
            };
        });

    }

    dynamodbSaveItem(item, ddbTable) {

        item.created_at = moment.utc().format();
        item.updated_at = moment.utc().format();

        const docClient = new AWS.DynamoDB.DocumentClient();
        return docClient.put({
            TableName: ddbTable,
            Item: item
        }).promise().then(result => {
            return item;
        });

    }
}

module.exports = dynamodbHelper;
