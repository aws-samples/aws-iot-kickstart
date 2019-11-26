const libs = require('./libs');

function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    let promise = null;

    switch (event.cmd) {
        case 'getSystemStats':
            promise = libs.getSystemStats(event, context);
            break;
        case 'deleteSystem':
            promise = libs.deleteSystem(event, context);
            break;
        case 'refreshSystem':
            promise = libs.refreshSystem(event, context).then(result => { return true; });
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + JSON.stringify(event), null);
            break;
    }

    if (promise) {
        promise.then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    }
}

exports.handler = handler;
