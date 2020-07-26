# sputnik - Device Types

## Table: sputnik-device-types

## Description

A device type, **DeviceType**, describes a physical device. Not what that device does. Just a physical device. A Raspberry Pi is just a Raspberry Pi.

A Raspberry Pi that has a [Sense Hat](https://www.raspberrypi.org/products/sense-hat/) or a [PiCamera](https://www.raspberrypi.org/products/camera-module-v2/) is very different to a standard Raspberry Pi.

The differences between these hardware devices is defined in a **DeviceType**.

**DeviceTypes** have important fields such as their:

* *id*: which is referred to by other blueprints
* *spec*: which defines the specifics of said device

## Object
```
{
    id: string;
    name: string;
    type: string;
    spec: any = {};
    createdAt: string;
    updatedAt: string;
}
```

## Spec

The spec portion of a **DeviceType** is where the magic happens and is quite common to all blueprints. It is used to trigger creation of AWS IoT and AWS IoT Greengrass resources and capabilities.

The spec also contains a View section that is used by the console to display widgets and associate them to the data source coming from the blueprints.

* For more information on the Deployment meta-language in the spec. [See the doc.](./deployment-meta-language.md) 
* For more information on enabling Widgets in the spec. [See the doc.](./blueprint-views.md) 


```
Example: rpi3-sense-hat-picamera-v1.0
{
    "CoreDefinitionVersion": {
        "Cores": [{
            "CertificateArn": "[CORE_CERTIFICATE_ARN]",
            "SyncShadow": true,
            "ThingArn": "[CORE_ARN]"
        }]
    },
    "FunctionDefinitionVersion": {
        "Functions": [{
            "FunctionArn": "arn:aws:lambda:::function:GGIPDetector:1",
            "FunctionConfiguration": {
                "Environment": {
                    "AccessSysfs": true,
                    "Variables": {}
                },
                "MemorySize": 32768,
                "Pinned": true,
                "Timeout": 3
            }
        }]
    },
    "LoggerDefinitionVersion": {
        "Loggers": [{
                "Component": "GreengrassSystem",
                "Level": "INFO",
                "Type": "AWSCloudWatch"
            },
            {
                "Component": "Lambda",
                "Level": "INFO",
                "Type": "AWSCloudWatch"
            },
            {
                "Component": "GreengrassSystem",
                "Level": "INFO",
                "Space": 300000,
                "Type": "FileSystem"
            },
            {
                "Component": "Lambda",
                "Level": "INFO",
                "Space": 300000,
                "Type": "FileSystem"
            }
        ]
    },
    "ResourceDefinitionVersion": {
        "Resources": [{
            "Id": "sense-hat-led",
            "Name": "sense-hat-led",
            "ResourceDataContainer": {
                "LocalDeviceResourceData": {
                    "GroupOwnerSetting": {
                        "AutoAddGroupOwner": true
                    },
                    "SourcePath": "/dev/fb1"
                }
            }
        }, {
            "Id": "sense-hat-i2c",
            "Name": "sense-hat-i2c",
            "ResourceDataContainer": {
                "LocalDeviceResourceData": {
                    "GroupOwnerSetting": {
                        "AutoAddGroupOwner": true
                    },
                    "SourcePath": "/dev/i2c-1"
                }
            }
        }, {
            "Id": "sense-hat-event0",
            "Name": "sense-hat-event0",
            "ResourceDataContainer": {
                "LocalDeviceResourceData": {
                    "GroupOwnerSetting": {
                        "AutoAddGroupOwner": true
                    },
                    "SourcePath": "/dev/input/event0"
                }
            }
        }, {
            "Id": "picamera-vcsm",
            "Name": "picamera-vcsm-resource",
            "ResourceDataContainer": {
                "LocalDeviceResourceData": {
                    "GroupOwnerSetting": {
                        "AutoAddGroupOwner": true
                    },
                    "SourcePath": "/dev/vcsm"
                }
            }
        }, {
            "Id": "picamera-vchiq",
            "Name": "picamera-vchiq-resource",
            "ResourceDataContainer": {
                "LocalDeviceResourceData": {
                    "GroupOwnerSetting": {
                        "AutoAddGroupOwner": true
                    },
                    "SourcePath": "/dev/vchiq"
                }
            }
        }]
    }
}
```
