const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');

const lib = 'listUsers';

function listUsers(limit, paginationToken) {
    let params = {
        UserPoolId: process.env.USER_POOL_ID,
        AttributesToGet: [
            'email',
            'nickname'
        ],
        Filter: ''
    };

    if (limit) {
        params.Limit = limit;
    }
    if (paginationToken) {
        params.PaginationToken = paginationToken;
    }

    console.log('listUsers: params:', params);

    return cognitoIdentityServiceProvider.listUsers(params).promise().then(data => {
        data.Users = data.Users.map(user => {
            let _user = {
                user_id: user.Username,
                name: '',
                email: '',
                enabled: user.Enabled,
                status: user.UserStatus
            };

            const _nm = _.where(user.Attributes, {
                Name: 'nickname'
            });

            const _em = _.where(user.Attributes, {
                Name: 'email'
            });

            if (_nm.length > 0) {
                _user.name = _nm[0].Value;
            }

            if (_em.length > 0) {
                _user.email = _em[0].Value;
            }

            return _user;
        });

        return data;
    });
}

module.exports = function (event, context) {
    return listUsers(event.limit, event.paginationToken);
};
