const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const listGreengrassGroupIdsForThingArn = require('sputnik-custom-resource-helper-utils').listGreengrassGroupIdsForThingArn;

module.exports = function (event, context) {

    const tag = `updateDevice(${event.thingId}):`;

    console.log(tag, event);

    // Event needs to be:
    // event.thingId
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.spec
    // event.name

    let _device;
    let _deviceType;

    console.log(tag, 'Start.');
    console.log(tag, 'Get Device for thingId:', event.thingId);
    console.log(tag, 'Get DeviceType for deviceTypeId:', event.deviceTypeId);

    return Promise.all([

        // Get the Device AND Get the Device Type of the current set Device
        documentClient.get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        }).promise().then(device => _device = device.Item).then(() => {

            return documentClient.get({
                TableName: process.env.TABLE_DEVICE_TYPES,
                Key: {
                    id: _device.deviceTypeId
                }
            }).promise().then(deviceType => _device.deviceType = deviceType.Item)
        }),

        // Get the Device Type that we want to potentially update to
        documentClient.get({
            TableName: process.env.TABLE_DEVICE_TYPES,
            Key: {
                id: event.deviceTypeId
            }
        }).promise().then(deviceType => _deviceType = deviceType.Item)

    ]).then(() => {

        if (!_deviceType) {
            console.log(tag, 'DeviceType to update to', event.deviceTypeId, 'does not exist. Setting it to UNKNOWN');
            _deviceType = {
                id: 'UNKNOWN',
                type: 'UNKNOWN'
            };
        }
        if (!_device.deviceType) {
            console.log(tag, 'DeviceType of current device', event.deviceTypeId, 'does not exist. Setting it to UNKNOWN');
            _device.deviceType = {
                id: 'UNKNOWN',
                type: 'UNKNOWN'
            };
        }

        // Note: we use the listGreengrassGroupIdsForThingArn because some Greengrass devices may have been created OUTSIDE Sputnik (example: Deeplens devices)

        if (_device.deviceType.type !== 'GREENGRASS' && _deviceType.type === 'GREENGRASS') {
            console.log(tag, 'Scenario1: Update request from NON GREENGRASS device TO GREENGRASS device.');
            // Create the GG Group if it does not already exist.

            return listGreengrassGroupIdsForThingArn(_device.thingArn).then(groupIds => {
                const tag2 = `${tag} listGreengrassGroupIdsForThingArn:`;
                console.log(tag2, 'Found groupIds:', groupIds);
                if (groupIds.length === 0) {
                    console.log(tag2, 'No group, lets create one.');
                    return gg
                        .createGroup({
                            Name: _device.thingName + '-gg-group'
                        })
                        .promise()
                        .then(group => {
                            return group.Id;
                        });
                } else if (groupIds.length >= 1) {
                    // Note: Sputnik ONLY supports 1 greengrass group per device
                    return groupIds[0];
                }
            });

        }

        if (_device.deviceType.type === 'GREENGRASS' && _deviceType.type !== 'GREENGRASS') {
            console.log(tag, 'Scenario 2: Update request from GREENGRASS device TO NON GREENGRASS device.');
            // GG Group should have been created, and should have been attached to the greengrassGroupId field of the Device.

            console.log(tag, 'Reset its deployments.');
            return gg
                .resetDeployments({
                    GroupId: _device.greengrassGroupId,
                    Force: true
                })
                .promise()
                .then(result => {
                    console.log(tag, 'Delete the group.');
                    return gg
                        .deleteGroup({
                            GroupId: _device.greengrassGroupId
                        })
                        .promise();
                })
                .then(() => {
                    return 'UNKNOWN';
                });
        }

    }).then(groupId => {

        console.log(tag, 'GG Group ID:', groupId);

        const updateParams = {
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            },
            UpdateExpression: 'set #ua = :ua, #n = :n, #dti = :dti, #dbi = :dbi, #s = :s',
            ExpressionAttributeNames: {
                '#ua': 'updatedAt',
                '#dti': 'deviceTypeId',
                '#dbi': 'deviceBlueprintId',
                '#s': 'spec',
                '#n': 'name'
            },
            ExpressionAttributeValues: {
                ':ua': moment()
                    .utc()
                    .format(),
                ':dti': _deviceType.id,
                ':dbi': event.deviceBlueprintId || 'UNKNOWN',
                ':s': event.spec,
                ':n': event.name
            }
        };

        if (groupId) {
            updateParams.UpdateExpression += ', #gid = :gid';
            updateParams.ExpressionAttributeNames['#gid'] = 'greengrassGroupId';
            updateParams.ExpressionAttributeValues[':gid'] = groupId;
        }

        console.log(tag, 'Updating the device with:', updateParams);

        return documentClient.update(updateParams).promise();

    }).then(() => {
        return documentClient.get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        }).promise();
    }).then(device => {
        console.log(tag, 'Returning the device:', device.Item);
        return device.Item;
    });

};
