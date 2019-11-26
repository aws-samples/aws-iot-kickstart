const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const forge = require('node-forge');

const moment = require('moment');
const _ = require('underscore');

const lib = 'justInTimeOnBoarding';

const addDevice = require('sputnik-devices-service').addDevice;

// {
//     "clientId": "iotconsole-1539277498927-0",
//     "timestamp": 1539277500864,
//     "eventType": "connected",
//     "sessionIdentifier": "9c1ce4ca-c79c-4561-89f6-dc57a574ebf3",
//     "principalIdentifier": "c997d377eec157293d10e4f0a75445eba59533ad9a2b802ffc217f55179c599b"
// }
function handler(event, context, callback) {
    const tag = `${lib}(${event.clientId}):`;
    console.log(tag, 'Event:', JSON.stringify(event, null, 2));

    // Get the certificate for the principal
    let _cert;
    // let _thingName;
    let _device;

    console.log(tag, 'First describe the certificate for the incoming principal.');
    iot.describeCertificate({
        certificateId: event.principalIdentifier
    })
        .promise()
        .catch(err => {
            if (err.code === 'ResourceNotFoundException') {
                console.log(tag, 'Sputnik does not support Just In Time Registration for now.');
                err.code = 'NoFail';
            }
            throw err;
        })
        .then(cert => {
            _cert = cert;
            console.log(tag, 'Found certificate:', _cert.certificateArn);

            return iot
                .listPrincipalThings({
                    principal: _cert.certificateDescription.certificateArn,
                    maxResults: 1
                })
                .promise()
                .then(data => {
                    if (data.things.length === 0) {
                        const newThingName = `sputnik-${shortid.generate()}`;
                        console.log(
                            tag,
                            'Cert is not attached to any thing. Create Sputnik Device with ThingName:',
                            newThingName
                        );
                        return addDevice({
                            deviceTypeId: 'UNKNOWN',
                            deviceBlueprintId: 'UNKNOWN',
                            thingName: newThingName,
                            name: newThingName
                        }).then(r => {
                            return iot
                                .describeThing({
                                    thingName: newThingName
                                })
                                .promise();
                        });
                    } else {
                        console.log(tag, 'Cert is attached to thing:', data.things[0]);
                        return iot
                            .describeThing({
                                thingName: data.things[0]
                            })
                            .promise();
                    }
                });
        })
        .then(thing => {
            console.log(tag, 'Found thing:', thing);

            const attributes = thing.attributes;
            if (attributes.iot_certificate_arn === _cert.certificateArn) {
                return thing;
            } else {
                attributes.iot_certificate_arn = _cert.certificateArn;
                console.log(tag, 'Updating the attributes:', attributes);
                return iot
                    .updateThing({
                        thingName: thing.thingName,
                        attributePayload: {
                            attributes: attributes,
                            merge: true
                        }
                    })
                    .promise()
                    .then(() => {
                        return iot
                            .describeThing({
                                thingName: thing.thingName
                            })
                            .promise();
                    });
            }
        })
        .then(thing => {
            console.log(tag, 'Fetch Sputnik Device.');
            return documentClient
                .get({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: thing.thingId
                    }
                })
                .promise()
                .then(device => {
                    if (!device.Item) {
                        console.log(tag, 'Device does not exist. Create it.');
                        return addDevice({
                            deviceTypeId: 'UNKNOWN',
                            deviceBlueprintId: 'UNKNOWN',
                            thingName: thing.thingName,
                            name: thing.thingName
                        }).then(r => {
                            return {
                                Item: r
                            };
                        });
                    } else {
                        return device;
                    }
                });
        })
        .then(device => {
            _device = device.Item;

            console.log(tag, 'Device:', _device);

            let newMomentTimestamp = moment(event.timestamp);
            let connectionState = {
                state: event.eventType,
                at: newMomentTimestamp.utc().format()
            };
            let updateParams = {
                TableName: process.env.TABLE_DEVICES,
                Key: {
                    thingId: _device.thingId
                },
                UpdateExpression: 'set #ua = :ua, #certArn = :certArn, #cS = :cS',
                ExpressionAttributeNames: {
                    '#ua': 'updatedAt',
                    '#certArn': 'certificateArn',
                    '#cS': 'connectionState'
                },
                ExpressionAttributeValues: {
                    ':ua': moment()
                        .utc()
                        .format(),
                    ':certArn': _cert.certificateDescription.certificateArn,
                    ':cS': connectionState
                }
            };

            console.log(tag, 'Check if the event timestamp is after existing one');

            if (_device && _device.hasOwnProperty('connectionState') && _device.connectionState.hasOwnProperty('at')) {
                let oldMomentTimestamp = moment(_device.connectionState.at);
                if (oldMomentTimestamp.isAfter(newMomentTimestamp)) {
                    console.log(tag, 'Skip update because MQTT messages are swapped');
                    console.log(tag, 'oldMomentTimestamp:', oldMomentTimestamp.utc().format());
                    console.log(tag, 'newMomentTimestamp:', newMomentTimestamp.utc().format());
                    return _device;
                }
            }

            return documentClient.update(updateParams).promise();
        })
        .then(result => {
            callback(null, null);
        })
        .catch(err => {
            console.log(tag, 'Error:', err, err.stack);
            if (err.code === 'NoFail') {
                callback(null, null);
            } else {
                callback(err, null);
            }
        });

}

exports.handler = handler;
