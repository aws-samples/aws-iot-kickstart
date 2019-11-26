const libs = require('./libs');

function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    let promise = null;

    switch (event.cmd) {
        case 'deleteUser':
            promise = libs.deleteUser;
            break;
        case 'disableUser':
            promise = libs.disableUser;
            break;
        case 'enableUser':
            promise = libs.enableUser;
            break;
        case 'getUser':
            promise = libs.getUser;
            break;
        case 'inviteUser':
            promise = libs.inviteUser;
            break;
        case 'listGroups':
            promise = libs.listGroups;
            break;
        case 'listUsers':
            promise = libs.listUsers;
            break;
        case 'updateUser':
            promise = libs.updateUser;
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
            break;
    }

    if (promise) {
        promise(event, context).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    }
}

exports.handler = handler;
