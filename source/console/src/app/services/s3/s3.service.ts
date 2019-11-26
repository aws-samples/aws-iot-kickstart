import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import * as AWS from 'aws-sdk';
import { AmplifyService } from 'aws-amplify-angular';

// Services
import { LoggerService } from '@services/logger.service';

declare var appVariables: any;

@Injectable()
export class S3Service {
    constructor(private amplifyService: AmplifyService, private logger: LoggerService) {}

    public getSignedUrlFor(key) {
        const _self = this;
        return _self.amplifyService
            .auth()
            .currentCredentials()
            .then(creds => {
                const s3 = new AWS.S3({
                    accessKeyId: creds.accessKeyId,
                    secretAccessKey: creds.secretAccessKey,
                    sessionToken: creds.sessionToken,
                    region: appVariables.REGION
                });
                return s3.getSignedUrl('getObject', { Bucket: appVariables.S3_DATA_BUCKET, Key: key });
            })
            .catch(err => {
                _self.logger.error(err);
            });
        // return this.s3.getSignedUrl('getObject', { Bucket: appVariables.S3_DATA_BUCKET, Key: key });
    }

    public deleteKey(key) {
        const _self = this;

        return _self.amplifyService
            .auth()
            .currentCredentials()
            .then(creds => {
                const s3 = new AWS.S3({
                    accessKeyId: creds.accessKeyId,
                    secretAccessKey: creds.secretAccessKey,
                    sessionToken: creds.sessionToken,
                    region: appVariables.REGION
                });
                return s3
                    .deleteObject({
                        Bucket: appVariables.S3_DATA_BUCKET,
                        Key: key
                    })
                    .promise();
            })
            .then(result => {
                _self.logger.info('key:', key, 'deleted');
                return;
            });
    }
}
