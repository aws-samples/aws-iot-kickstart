const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const UsageMetrics = require('usage-metrics');
const moment = require('moment');

const lib = 'createCertificate';

// Following function creates a certificate for AWS IoT using the AWS CA for a sputnik Device
// Function parameters:
// - .csr: CSR in pem format
// - .thingId: Device Thind Id

module.exports = function(event, context) {
    const usageMetrics = new UsageMetrics();
    const tag = `${lib}(${event.thingId}):`;

    console.log(tag, 'Start: Request cert creation from CSR:', event.csr);

    return documentClient
        .get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        })
        .promise()
        .then(device => {
            event.device = device.Item;

            if (event.device) {
                console.log(tag, 'Device exists, thingName:', event.device.thingName);

                return iot
                    .createCertificateFromCsr({
                        certificateSigningRequest: event.csr,
                        setAsActive: true
                    })
                    .promise();

            } else {
                console.error(tag, 'Device does not exist. Do nothing');
                throw 'Device does not exist!';
            }
        })
        .then(cert => {
            event.cert = cert;
            console.log(tag, 'CertificateId', event.cert.certificateId);

            return Promise.all([
                    iot
                        .attachThingPrincipal({
                            principal: event.cert.certificateArn,
                            thingName: event.device.thingName
                        })
                        .promise(),
                    iot
                        .attachPrincipalPolicy({
                            principal: event.cert.certificateArn,
                            policyName: process.env.IOT_DEFAULT_CONNECT_POLICY
                        })
                        .promise()
                ]);
        }).then(result => {

            const updateParams = {
                TableName: process.env.TABLE_DEVICES,
                Key: {
                    thingId: event.thingId
                },
                UpdateExpression: 'set #ua = :ua, #certArn = :certArn',
                ExpressionAttributeNames: {
                    '#ua': 'updatedAt',
                    '#certArn': 'certificateArn'
                },
                ExpressionAttributeValues: {
                    ':ua': moment()
                        .utc()
                        .format(),
                    ':certArn': event.cert.certificateArn
                }
            };

            return documentClient.update(updateParams).promise();

        }).then(() => {
            return event.cert;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });

    // return iot
    //     .createCertificateFromCsr({
    //         certificateSigningRequest: event.csr,
    //         setAsActive: true
    //     })
    //     .promise()
    //     .then(data => {
    //         _cert = data;
    //         console.log(tag, 'CertificateId', _cert.certificateId, event.attachToThing);

    //         if (event.attachToThing) {
    //             return Promise.all([
    //                 iot
    //                     .attachThingPrincipal({
    //                         principal: _cert.certificateArn,
    //                         thingName: event.thingName
    //                     })
    //                     .promise(),
    //                 iot
    //                     .attachPrincipalPolicy({
    //                         principal: _cert.certificateArn,
    //                         policyName: process.env.IOT_DEFAULT_CONNECT_POLICY
    //                     })
    //                     .promise()
    //             ]).then(r => {
    //                 console.log(tag, 'The thing exists, and has been attached. Lets update the device if it exists');
    //                 return iot
    //                     .describeThing({
    //                         thingName: event.thingName
    //                     })
    //                     .promise()
    //                     .then(thing => {
    //                         return documentClient
    //                             .get({
    //                                 TableName: process.env.TABLE_DEVICES,
    //                                 Key: {
    //                                     thingId: thing.thingId
    //                                 }
    //                             })
    //                             .promise()
    //                             .then(device => {
    //                                 if (device.Item) {
    //                                     console.log(tag, 'Device exists, updating its certificateArn');
    //                                     const updateParams = {
    //                                         TableName: process.env.TABLE_DEVICES,
    //                                         Key: {
    //                                             thingId: thing.thingId
    //                                         },
    //                                         UpdateExpression: 'set #ua = :ua, #certArn = :certArn',
    //                                         ExpressionAttributeNames: {
    //                                             '#ua': 'updatedAt',
    //                                             '#certArn': 'certificateArn'
    //                                         },
    //                                         ExpressionAttributeValues: {
    //                                             ':ua': moment()
    //                                                 .utc()
    //                                                 .format(),
    //                                             ':certArn': _cert.certificateArn
    //                                         }
    //                                     };

    //                                     return documentClient.update(updateParams).promise();
    //                                 } else {
    //                                     console.log(tag, 'Device does not exist. Do nothing');
    //                                     return Promise.resolve(null);
    //                                 }
    //                             });
    //                     });
    //             });
    //         } else {
    //             return Promise.resolve(null);
    //         }
    //     })
    //     .then(result => {
    //         return _cert;
    //     })
    //     .catch(err => {
    //         console.error(tag, err);
    //         throw err;
    //     });
};
