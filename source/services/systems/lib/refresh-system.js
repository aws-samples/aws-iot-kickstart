const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');
const shortid = require('shortid');

const lib = 'refreshSystem';

function processDeviceList(deviceListSpec, deviceList) {
    const tag = `${lib}(processDeviceList):`;

    function deviceByRef(ref) {
        return deviceList[
            deviceListSpec.findIndex(device => {
                return device.ref === ref;
            })
        ];
    }

    return deviceListSpec.reduce((previousSystemDevice, currentSystemDevice, index, array) => {
        return previousSystemDevice.then(reduceResultChain => {
            console.log(tag, 'CurrentValue:', index, JSON.stringify(currentSystemDevice));
            console.log(tag, 'reduceResultChain:', index, JSON.stringify(reduceResultChain));

            let occurencesOfGetAtt = JSON.stringify(currentSystemDevice).split('!GetAtt[');

            if (occurencesOfGetAtt.length > 1) {
                // Found at least 1 occurence of !GetAtt in our spec.

                console.log(tag, `Found ${occurencesOfGetAtt.length} GetAtts`);

                occurencesOfGetAtt.forEach((occurence, i) => {
                    if (i !== 0) {
                        // Skip first one (which is everything before 1st occurence)

                        const split = occurence.split(']');
                        const queryString = split[0];
                        const attributes = queryString.split('.');

                        const value = attributes.reduce((pv, cv, j) => {
                            if (j === 0) {
                                // This is the reference to the device
                                return deviceByRef(cv);
                            } else {
                                if (pv) {
                                    return pv[cv]
                                } else {
                                    return null;
                                }
                            }
                        }, '');

                        console.log(tag, `!GetAtt[${queryString}]: ${value}`);
                        split.shift();
                        occurencesOfGetAtt[i] = '' + value + split.join(']');
                        console.log(tag, `GetAtt: occurencesOfGetAtt[${i}]:`, occurencesOfGetAtt[i]);
                    }
                });
            }

            currentSystemDevice = JSON.parse(occurencesOfGetAtt.join(''));
            currentSystemDevice.device = deviceList[index];

            console.log(tag, 'Updating device', currentSystemDevice.spec);

            if (currentSystemDevice.device) {
                return documentClient
                    .update({
                        TableName: process.env.TABLE_DEVICES,
                        Key: {
                            thingId: currentSystemDevice.device.thingId
                        },
                        UpdateExpression: 'set #ua = :ua, #spec = :spec',
                        ExpressionAttributeNames: {
                            '#ua': 'updatedAt',
                            '#spec': 'spec'
                        },
                        ExpressionAttributeValues: {
                            ':ua': moment()
                                .utc()
                                .format(),
                            ':spec': currentSystemDevice.spec || {}
                        }
                    })
                    .promise()
                    .then(result => {
                        currentSystemDevice.device.spec = currentSystemDevice.spec;
                        return [...reduceResultChain, currentSystemDevice];
                    });
            } else {
                return [...reduceResultChain, currentSystemDevice];
            }
        });
    }, Promise.resolve([]).then(arrayOfResults => arrayOfResults));
}

module.exports = function(event, context) {
    const tag = `${lib}:`;
    // Event:
    // {
    //     "cmd": "refreshSystem",
    //     "systemId": "id"
    // }

    // First get the system
    let _system;
    return documentClient
        .get({
            TableName: process.env.TABLE_SYSTEMS,
            Key: {
                id: event.id
            }
        })
        .promise()
        .then(system => {
            _system = system.Item;

            if (!_system) {
                throw 'System does not exist.';
            } else {
                console.log(tag, 'Found system');
                return documentClient
                    .get({
                        TableName: process.env.TABLE_SYSTEM_BLUEPRINTS,
                        Key: {
                            id: _system.systemBlueprintId
                        }
                    })
                    .promise();
            }
        })
        .then(systemBlueprint => {
            _systemBlueprint = systemBlueprint.Item;

            if (!_systemBlueprint) {
                throw 'SystemBlueprint ' + _system.systemBlueprintId + ' does not exist.';
            } else {
                if (
                    !_systemBlueprint.spec.hasOwnProperty('Devices') &&
                    _system.deviceIds.length !== _systemBlueprint.spec.Devices.length
                ) {
                    // throw 'System has inconsistent deviceIds and devices length in spec';
                    return [];
                } else {
                    return Promise.all(
                        _system.deviceIds.map(thingId => {
                            return documentClient
                                .get({
                                    TableName: process.env.TABLE_DEVICES,
                                    Key: {
                                        thingId: thingId
                                    }
                                })
                                .promise()
                                .then(device => {
                                    device = device.Item;
                                    if (!device) {
                                        throw 'Device for thingId ' + thingId + ' does not exist anymore!';
                                    }
                                    return device;
                                });
                        })
                    );
                }
            }
        })
        .then(devices => {
            console.log(tag, 'end:', devices);
            return processDeviceList(_systemBlueprint.spec.Devices, devices);
        });
};
