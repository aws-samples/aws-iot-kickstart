const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const setUserGroups = require('./setUserGroups');

const lib = 'updateUser';

function updateUser(username, groups) {

    return setUserGroups(process.env.USER_POOL_ID, username, groups, 0).then(result => {
        return result;
    });
}

module.exports = function (event, context) {
    return updateUser(event.username, event.groups);
};
