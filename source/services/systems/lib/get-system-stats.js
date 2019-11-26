const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');


const lib = 'getSystemStats';

function getSystemStatsRecursive(lastEvalKey) {

    console.log(lib, lastEvalKey);

    let params = {
        TableName: process.env.TABLE_SYSTEMS,
        Limit: 75
    };

    if (lastEvalKey) {
        params.ExclusiveStartKey = lastEvalKey;
    }

    params.ProjectionExpression = 'id, thingId, systemBlueprintId';

    return documentClient.scan(params).promise().then(results => {
        console.log('scan', results.Items.length);
        let _stats = {
            total: results.Items.length
        };

        if (results.LastEvaluatedKey) {
            return getSystemStatsRecursive(result.LastEvaluatedKey).then(data => {
                // _stats.connected += data.connected;
                // _stats.disconnected += data.disconnected;
                _stats.total += data.total;
                return _stats;
            });
        } else {
            return _stats;
        }
    });
}

module.exports = function (event, context, callback) {
    return getSystemStatsRecursive();
};
