const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteDevice';

// Deletes a sputnik device.
// Inputs:
// .thingId: device identified by thingId to delete

module.exports = function(event, context) {
    const tag = `${lib}(${event.thingId}):`;

    return documentClient
        .get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        })
        .promise()
        .then(device => {
            if (!device.Item) {
                console.error(tag, 'Device requested does not exist in Sputnik:', event.thingId);
                throw {
                    error: 404,
                    message: 'Device ' + event.thingId + ' does not exist.'
                };
            }

            event.device = device.Item;
            console.log(tag, 'Device to delete:', event.device);

            return iot.describeThing({
                thingName: event.device.thingName
            }).promise().then(thing => {

                return iot
                    .listThingPrincipals({
                        thingName: event.device.thingName
                    })
                    .promise()
                    .then(principals => {
                        principals = principals.principals;
                        console.log(tag, 'Found', principals.length, 'certificates to be deleted.');
                        return Promise.all(
                            principals.map(principalArn => {
                                return iot
                                    .listPrincipalPolicies({
                                        principal: principalArn
                                    })
                                    .promise()
                                    .then(policies => {
                                        policies = policies.policies;
                                        console.log(
                                            tag,
                                            'Found',
                                            policies.length,
                                            'policies to be detached.'
                                        );
                                        return Promise.all(
                                            policies.map(policy => {
                                                console.log(
                                                    tag,
                                                    'Detaching',
                                                    policy.policyName,
                                                    'from certificate',
                                                    principalArn
                                                );
                                                return iot
                                                    .detachPrincipalPolicy({
                                                        policyName: policy.policyName,
                                                        principal: principalArn
                                                    })
                                                    .promise();
                                            })
                                        ).then(detachedPolicies => {
                                            console.log(
                                                tag,
                                                'Detaching',
                                                event.device.thingName,
                                                'from certificate',
                                                principalArn
                                            );
                                            return iot
                                                .detachThingPrincipal({
                                                    thingName: event.device.thingName,
                                                    principal: principalArn
                                                })
                                                .promise();
                                        });
                                    })
                                    .then(result => {
                                        console.log(tag, 'Making the certificate Inactive');
                                        return iot
                                            .updateCertificate({
                                                certificateId: principalArn.split('/')[1],
                                                newStatus: 'INACTIVE'
                                            })
                                            .promise();
                                    })
                                    .then(result => {
                                        console.log(tag, 'Deleting certificate', principalArn);
                                        return iot
                                            .deleteCertificate({
                                                certificateId: principalArn.split('/')[1]
                                            })
                                            .promise();
                                    });
                            })
                        );
                    })
                    .then(result => {
                        // At this point, thing is ready to be deleted
                        console.log(tag, 'Done with the certificate');
                        if (
                            event.device.greengrassGroupId !== 'NOT_A_GREENGRASS_DEVICE' &&
                            event.device.greengrassGroupId !== 'UNKNOWN'
                        ) {
                            console.log(
                                tag,
                                'Device was a Greengrass group. Lets clean it up.',
                                event.device.greengrassGroupId
                            );
                            console.log(tag, 'Reseting the deployments');
                            return gg
                                .resetDeployments({
                                    GroupId: event.device.greengrassGroupId,
                                    Force: true
                                })
                                .promise()
                                .then(result => {
                                    console.log(tag, 'Deleting the group');
                                    return gg
                                        .deleteGroup({
                                            GroupId: event.device.greengrassGroupId
                                        })
                                        .promise();
                                });
                        } else {
                            return;
                        }
                    })
                    .then(result => {
                        return iot
                            .deleteThing({
                                thingName: event.device.thingName
                            })
                            .promise();
                    }).then(thing => {
                        console.log(tag, 'Deleted the thing.');
                        return;
                    });

            }).catch(err => {
                // This is the use case for which we've created the device in sputnik, but the thing does not exist.
                return;
            });
        })
        .then(() => {
            console.log(tag, 'Deleting the device.');

            return documentClient
                .delete({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: event.thingId
                    }
                })
                .promise();
        })
        .then(results => {
            console.log(tag, 'We are done. Lets return the device');
            return event.device;
        });
};
