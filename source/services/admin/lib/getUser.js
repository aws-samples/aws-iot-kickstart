const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const lib = 'getUser';

function getUser(username) {

    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: username
    };

    return cognitoIdentityServiceProvider.adminGetUser(params).promise().then(data => {
        let _user = {
            user_id: data.Username,
            name: '',
            email: '',
            groups: [],
            enabled: data.Enabled,
            created_at: data.UserCreateDate,
            updated_at: data.UserLastModifiedDate
        };
        let _nm = _.where(data.UserAttributes, {
            Name: 'nickname'
        });
        if (_nm.length > 0) {
            _user.name = _nm[0].Value;
        }

        let _em = _.where(data.UserAttributes, {
            Name: 'email'
        });
        if (_em.length > 0) {
            _user.email = _em[0].Value;
        }

        return cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise().then(grps => {

            grps.Groups.forEach(group => {
                _user.groups.push({
                    name: group.GroupName
                });
            });

            return _user;
        });

    });
}


module.exports = function (event, context) {
    return getUser(event.username);
};
