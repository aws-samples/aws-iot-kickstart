const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');
const setUserGroups = require('./setUserGroups');
const generatePassword = require('./generatePassword');

const lib = 'inviteUser';

function inviteUser(name, email, groups) {

    console.log('inviteUser:', name, email, groups);
    const _username = email.replace('@', '_').replace(/\./g, '_');

    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: _username,
        DesiredDeliveryMediums: ['EMAIL'],
        ForceAliasCreation: true,
        // TemporaryPassword: _password,
        UserAttributes: [{
            Name: 'email',
            Value: email
        }, {
            Name: 'email_verified',
            Value: 'true'
        }, {
            Name: 'nickname',
            Value: name
        }]
    };

    return cognitoIdentityServiceProvider.adminCreateUser(params).promise().then(data => {
        return setUserGroups(process.env.USER_POOL_ID, _username, groups).then(result => {
            // return data;
            return true;
        });
    });
}

module.exports = function (event, context) {
    return inviteUser(event.name, event.email, event.groups);
};

