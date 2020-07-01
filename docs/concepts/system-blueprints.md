# sputnik - System Blueprints

## Table: sputnik-system-blueprints

## Description

A system blueprint, **SystemBlueprint**, describes what a system of devices described by their DeviceBlueprints do.

The **SystemBlueprint** describes a truck, a ship etc ... These systems will consist of multiple devices, each running their own business logic.

**SystemBlueprints** have important fields such as their:

* *spec*: which defines the specifics of said blueprint

## Object
```
{
    id: string;
    name: string;
    description: string;
    prefix: string;
    spec: any = {};
    createdAt: string;
    updatedAt: string;
}
```

## Spec

The spec portion of a **SystemBlueprint** is where the magic happens and is quite common to all blueprints. It is used to trigger creation of AWS IoT and AWS IoT Greengrass resources and capabilities.

The spec also contains a View section that is used by the console to display widgets and associate them to the data source coming from the blueprints.

* For more information on the Deployment meta-language in the spec. [See the doc.](./deployment-meta-language.md) 
* For more information on enabling Widgets in the spec. [See the doc.](./blueprint-views.md) 


```
Example: sample-system-v1.0
{
    "Devices": [{
            "defaultDeviceTypeId": "simple-greengrass-device-v1.0",
            "deviceBlueprintId": [
                "empty-gg-blueprint-v1.0",
                "rpi3-sense-hat-demo-v1.0"
            ],
            "ref": "DEVICE",
            "spec": {
                "FunctionDefinitionVersion": {
                    "Functions": [{
                        "FunctionArn": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-hello-world-python:Prod",
                        "FunctionConfiguration": {
                            "EncodingType": "json",
                            "Environment": {
                                "AccessSysfs": true,
                                "ResourceAccessPolicies": [],
                                "Variables": {}

                            },
                            "MemorySize": 16384,
                            "Pinned": true,
                            "Timeout": 25
                        }
                    }, {
                        "FunctionArn": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-simple-greengrass-device-demo-python:Prod",
                        "FunctionConfiguration": {
                            "EncodingType": "json",
                            "Environment": {
                                "Variables": {
                                    "IOT_ENDPOINT": "[IOT_ENDPOINT]",
                                    "THING_NAME": "!GetAtt[DEVICE.thingName]",
                                    "GATEWAY": "!GetAtt[GATEWAY.thingName]",
                                    "GATEWAY_GG_GROUP_ID": "!GetAtt[GATEWAY.greengrassGroupId]"
                                },
                                "Execution": {
                                    "IsolationMode": "NoContainer"
                                }
                            },
                            "Pinned": true,
                            "Timeout": 5
                        }
                    }]
                },
                "SubscriptionDefinitionVersion": {
                    "Subscriptions": [{
                        "Source": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-hello-world-python:Prod",
                        "Target": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-simple-greengrass-device-demo-python:Prod",
                        "Subject": "hello/world"
                    }]
                }
            }
        },
        {
            "defaultDeviceTypeId": "simple-greengrass-device-v1.0",
            "deviceBlueprintId": [
                "empty-gg-blueprint-v1.0",
                "rpi3-sense-hat-demo-v1.0"
            ],
            "ref": "GATEWAY",
            "spec": {
                "DeviceDefinitionVersion": {
                    "Devices": [{
                        "CertificateArn": "!GetAtt[DEVICE.certificateArn]",
                        "SyncShadow": true,
                        "ThingArn": "!GetAtt[DEVICE.thingArn]"
                    }]
                },
                "FunctionDefinitionVersion": {
                    "Functions": [{
                        "FunctionArn": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-simple-greengrass-gateway-demo-python:Prod",
                        "FunctionConfiguration": {
                            "EncodingType": "json",
                            "Environment": {
                                "AccessSysfs": true,
                                "ResourceAccessPolicies": [],
                                "Variables": {
                                    "THING_NAME": "[CORE]",
                                    "DEVICE_NAME": "!GetAtt[DEVICE.thingName]"
                                }

                            },
                            "MemorySize": 16384,
                            "Pinned": false,
                            "Timeout": 3
                        }
                    }]
                },
                "SubscriptionDefinitionVersion": {
                    "Subscriptions": [{
                            "Source": "GGShadowService",
                            "Target": "arn:aws:iot:[AWS_REGION]:[AWS_ACCOUNT]:thing/!GetAtt[DEVICE.thingName]",
                            "Subject": "$aws/things/!GetAtt[DEVICE.thingName]/#"
                        },
                        {
                            "Source": "arn:aws:iot:[AWS_REGION]:[AWS_ACCOUNT]:thing/!GetAtt[DEVICE.thingName]",
                            "Target": "GGShadowService",
                            "Subject": "$aws/things/!GetAtt[DEVICE.thingName]/#"
                        },
                        {
                            "Source": "arn:aws:iot:[AWS_REGION]:[AWS_ACCOUNT]:thing/!GetAtt[DEVICE.thingName]",
                            "Target": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-simple-greengrass-gateway-demo-python:Prod",
                            "Subject": "#"
                        }, {
                            "Source": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-simple-greengrass-gateway-demo-python:Prod",
                            "Target": "cloud",
                            "Subject": "sputnik/[CORE]/#"
                        }
                    ]
                }

            }
        }
    ],
    "View": {
        "widgets": [{
            "data": {
                "text": [{
                        "data": {
                            "value": "Hello:"
                        },
                        "type": "text",
                        "class": "col-6"
                    },
                    {
                        "data": {
                            "value": "world!"
                        },
                        "type": "text",
                        "class": "col-6"
                    }
                ],
                "title": [{
                    "data": {
                        "value": "[SYSTEM_NAME]"
                    },
                    "type": "text",
                    "class": "col-12"
                }]
            },
            "type": "card",
            "class": "col-12 col-md-6"
        }]
    }
}
```
