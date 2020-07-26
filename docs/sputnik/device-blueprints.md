# sputnik - Device Blueprints

## Table: sputnik-device-blueprints

## Description

A device blueprint, **DeviceBlueprint**, describes what a device described by its DeviceType does. It is the device's business logic. Analogy: it is the device's firmware.

**DeviceBlueprints** have important fields such as their:

* *id*: which is referred to by other blueprints
* *compatibility*: defines which DeviceTypes this **DeviceBlueprint** is compatible with
* *deviceTypeMappings*: defines how specific resources between the business logic is mapped to the resources of a given DeviceType
* *spec*: which defines the specifics of said blueprint

## Object
```
{
    id: string;
    name: string;
    type: string;
    compatibility: string[] = [];
    deviceTypeMappings: any = [];
    spec: any = {};
    createdAt: string;
    updatedAt: string;
}
```

## Compatibility

The compatibility portion of the **DeviceBlueprint** object defines the DeviceTypes that are compatible with this blueprint.

For example: a blueprint that runs machine learning inference off of a camera, could run on a Deeplens and on a Raspberry Pi equipped with a camera, but could not run on a Raspberry Pi without.

_Note: Obviously allowing a blueprint to operate over multiple DeviceTypes requires the blueprint code to support multiple types of devices._

```
Example: ml-demo-squeezenet-v1.0
[
	"deeplens-aws-v1.0", 
	"deeplens-sputnik-v1.0", 
	"intel-up2-webcam-v1.0", 
	"rpi3-picamera-v1.0", 
	"rpi3-sense-hat-picamera-v1.0"
]
```

## DeviceTypeMappings

DeviceTypes may have unique resource definitions and may have resources that are referred to differently. DeviceTypeMappings section of the **DeviceBlueprint** object maps these difference between the DeviceTypes and the spec.

For example: A Raspberry Pi equipped with the PiCamera will use it's camera under the /dev/vcsm and /dev/vchiq devices. A Raspberry Pi equipped with a webcam will use it's camera under the generic /dev/video0 device.

_Note: Obviously allowing a blueprint to operate over multiple DeviceTypes requires the blueprint code to support multiple types of devices._

```
Example: ml-demo-squeezenet-v1.0
[{
    "substitute": "CAM_STREAM_ID_1",
    "value": {
        "deeplens-sputnik-v1.0": "stream",
        "deeplens-aws-v1.0": "stream",
        "intel-up2-webcam-v1.0": "video0",
        "rpi3-picamera-v1.0": "picamera-vcsm",
        "rpi3-sense-hat-picamera-v1.0": "picamera-vcsm"
    }
}, {
    "substitute": "CAM_STREAM_ID_2",
    "value": {
        "deeplens-sputnik-v1.0": "null",
        "deeplens-aws-v1.0": "null",
        "intel-up2-webcam-v1.0": "null",
        "rpi3-picamera-v1.0": "picamera-vchiq",
        "rpi3-sense-hat-picamera-v1.0": "picamera-vchiq"
    }
}, {
    "substitute": "CAM_STREAM_PERMISSIONS",
    "value": {
        "deeplens-sputnik-v1.0": "ro",
        "deeplens-aws-v1.0": "ro",
        "intel-up2-webcam-v1.0": "rw",
        "rpi3-picamera-v1.0": "rw",
        "rpi3-sense-hat-picamera-v1.0": "rw"
    }
}, {
    "substitute": "CAMERA_TYPE",
    "value": {
        "deeplens-sputnik-v1.0": "awscam",
        "deeplens-aws-v1.0": "awscam",
        "intel-up2-webcam-v1.0": "video0",
        "rpi3-picamera-v1.0": "picamera",
        "rpi3-sense-hat-picamera-v1.0": "picamera"
    }
}, {
    "substitute": "PATH_TO_CAMERA",
    "value": {
        "deeplens-sputnik-v1.0": "/opt/awscam/out/ch2_out.mjpeg",
        "deeplens-aws-v1.0": "/opt/awscam/out/ch2_out.mjpeg",
        "intel-up2-webcam-v1.0": "/dev/video0",
        "rpi3-picamera-v1.0": "NA",
        "rpi3-sense-hat-picamera-v1.0": "NA"
    }
}, {
    "substitute": "ML_MODEL_TYPE",
    "value": {
        "deeplens-sputnik-v1.0": "optimized",
        "deeplens-aws-v1.0": "optimized",
        "intel-up2-webcam-v1.0": "non_optimized",
        "rpi3-picamera-v1.0": "non_optimized",
        "rpi3-sense-hat-picamera-v1.0": "non_optimized"
    }
}, {
    "substitute": "GPU",
    "value": {
        "deeplens-sputnik-v1.0": "gpu",
        "deeplens-aws-v1.0": "gpu",
        "intel-up2-webcam-v1.0": "gpu",
        "rpi3-picamera-v1.0": "null",
        "rpi3-sense-hat-picamera-v1.0": "null"
    }
}]
```

## Spec

The spec portion of a **DeviceBlueprint** is where the magic happens and is quite common to all blueprints. It is used to trigger creation of AWS IoT and AWS IoT Greengrass resources and capabilities.

The spec also contains a View section that is used by the console to display widgets and associate them to the data source coming from the blueprints.

* For more information on the Deployment meta-language in the spec. [See the doc.](./deployment-meta-language.md) 
* For more information on enabling Widgets in the spec. [See the doc.](./blueprint-views.md) 


```
Example: ml-demo-squeezenet-v1.0
{
    "FunctionDefinitionVersion": {
        "Functions": [{
            "FunctionArn": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-gg-ml-inference-squeezenet-demo-python:Prod",
            "FunctionConfiguration": {
                "EncodingType": "json",
                "Environment": {
                    "AccessSysfs": true,
                    "ResourceAccessPolicies": [{
                            "Permission": "rw",
                            "ResourceId": "tmp"
                        },
                        {
                            "Permission": "rw",
                            "ResourceId": "sputnik-model-squeezenet"
                        },
                        {
                            "Permission": "[CAM_STREAM_PERMISSIONS]",
                            "ResourceId": "[CAM_STREAM_ID_1]"
                        },
                        {
                            "Permission": "[CAM_STREAM_PERMISSIONS]",
                            "ResourceId": "[CAM_STREAM_ID_2]"
                        },
                        {
                            "Permission": "rw",
                            "ResourceId": "[GPU]"
                        }
                    ],
                    "Variables": {
                        "ML_MODEL_TYPE": "[ML_MODEL_TYPE]",
                        "ML_MODEL_PATH": "/greengrass-machine-learning/mxnet/squeezenet/",
                        "CAMERA_TYPE": "[CAMERA_TYPE]",
                        "PATH_TO_CAMERA": "[PATH_TO_CAMERA]",
                        "MXNET_ENGINE_TYPE": "NaiveEngine"
                    }
                },
                "MemorySize": 98304,
                "Pinned": true,
                "Timeout": 25
            }
        }]
    },
    "ResourceDefinitionVersion": {
        "Resources": [{
                "Id": "sputnik-model-squeezenet",
                "Name": "sputnik-model-squeezenet",
                "ResourceDataContainer": {
                    "S3MachineLearningModelResourceData": {
                        "DestinationPath": "/greengrass-machine-learning/mxnet/squeezenet/",
                        "S3Uri": "[DATA_BUCKET_S3_URL]/Greengrass/models/ml-demo-squeezenet-v1.0/squeezenet.zip"
                    }
                }
            },
            {
                "Id": "tmp",
                "Name": "tmp_resource",
                "ResourceDataContainer": {
                    "LocalVolumeResourceData": {
                        "DestinationPath": "/tmp",
                        "GroupOwnerSetting": {
                            "AutoAddGroupOwner": true
                        },
                        "SourcePath": "/tmp"
                    }
                }
            },
            {
                "Id": "null",
                "Name": "null_resource",
                "ResourceDataContainer": {
                    "LocalDeviceResourceData": {
                        "GroupOwnerSetting": {
                            "AutoAddGroupOwner": true
                        },
                        "SourcePath": "/dev/null"
                    }
                }
            }
        ]
    },
    "SubscriptionDefinitionVersion": {
        "Subscriptions": [{
            "Source": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-gg-ml-inference-squeezenet-demo-python:Prod",
            "Subject": "sputnik/[CORE]/logger",
            "Target": "cloud"
        }, {
            "Source": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:sputnik-gg-ml-inference-squeezenet-demo-python:Prod",
            "Subject": "sputnik/[CORE]/camera",
            "Target": "cloud"
        }]
    }
}
```
