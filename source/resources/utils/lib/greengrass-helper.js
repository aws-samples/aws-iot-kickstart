'use strict';

let AWS = require('aws-sdk');
const fs = require('fs');
const moment = require('moment');

/**
 *
 * @class greengrassHelper
 */
class greengrassHelper {
    /**
     * @class greengrassHelper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    associateServiceRoleToAccount() {
        const gg = new AWS.Greengrass();
        return gg
            .associateServiceRoleToAccount({
                RoleArn: process.env.GREENGRASS_SERVICE_ROLE_ARN
            })
            .promise()
            .then(data => {
                return data;
            });
    }

}

module.exports = greengrassHelper;
