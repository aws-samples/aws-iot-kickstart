'use strict';

let AWS = require('aws-sdk');
const fs = require('fs');

/**
 * Helper function to interact with AWS S3 for cfn custom resource.
 *
 * @class s3Helper
 */
class s3Helper {

    /**
     * @class s3Helper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    copyFileFromS3ToS3(sourceS3Bucket, sourceS3Key, destS3Bucket, destS3Key) {
        console.log(`source bucket: ${sourceS3Bucket}`);
        console.log(`source key: ${sourceS3Key}`);
        console.log(`dest bucket: ${destS3Bucket}`);
        console.log(`dest key: ${destS3Key}`);


        const params = {
            Bucket: destS3Bucket,
            Key: destS3Key,
            CopySource: [sourceS3Bucket, sourceS3Key].join('/'),
            MetadataDirective: 'REPLACE'
        };

        // params.ContentType = this._setContentType(filelist[index]);
        // params.Metadata = {
        //     'Content-Type': params.ContentType
        // };
        // console.log(params);
        const s3 = new AWS.S3();

        return s3.copyObject(params).promise().then(data => {
            console.log(`${sourceS3Bucket}/${sourceS3Key} copied successfully`);
            return data;
        }).catch(err => {
            throw `error copying ${sourceS3Bucket}/${sourceS3Key}\n${err}`;
        });
    }

    listObjectsV2(params) {
        const s3 = new AWS.S3({ region: 'us-east-1'});

        console.log('listObjectsV2:', params);
        return s3.listObjectsV2(params).promise().then(data => {
            return data;
        });
    }

}

module.exports = s3Helper;
