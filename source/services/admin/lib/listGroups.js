const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const lib = 'listGroups';

function listGroups(limit, nextToken) {
    let params = {
        UserPoolId: process.env.USER_POOL_ID
    };
    if (limit) {
        params.Limit = limit;
    }
    if (nextToken) {
        params.NextToken = nextToken;
    }

    return cognitoIdentityServiceProvider.listGroups(params).promise().then(data => {
        return data;
    });
}


module.exports = function (event, context) {
    return listGroups(event.limit, event.nextToken);
};
