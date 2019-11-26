const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const lib = 'disableUser';

function disableUser(username) {

    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: username
    };

    return cognitoIdentityServiceProvider.adminDisableUser(params).promise().then(data => {
        return data;
    });
}

module.exports = function (event, context) {
    return disableUser(event.username);
};
