const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const lib = 'setUserGroups';

function setUserGroups(poolinfo, username, groups) {
    const _self = this;

    return Promise.all(groups.map(group => {
        const params = {
            GroupName: group.name,
            UserPoolId: poolinfo,
            Username: username
        };
        if (group._state === 'new') {
            return cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
        } else if (group._state === 'deleted') {
            return cognitoIdentityServiceProvider.adminRemoveUserFromGroup(params).promise();
        } else {
            return null;
        }
    })).then(results => {
        return 'group modifications complete';
    });
}

module.exports = setUserGroups;
