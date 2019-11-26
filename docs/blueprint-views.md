# sputnik - Blueprint Views

A blueprint, in sputnik, will have it's own View. This has the benefit of being able to display data coming from your device in a specific and custom way.

For systems, sputnik, will combine the views of all the devices that make the system, into the view.

Sputnik supports 2 types of visualizations for your devices.

## Type 1: Custom views
Some of your devices will require specific visualization for which you are free to implement custom HTML/Javascript/CSS code.

An example of this is provided for the ml-demo-squeezenet-v1.0 blueprint.

```
.
├── README.md
├── deployment
├── docs
├── images
└── source
    ├── cf
    ├── console
    │   ├── src
    │   │   ├── app
    │   │   │   ├── secure
    │   │   │   │   ├── child-views
    │   │   │   │   │   ├── devices
    │   │   │   │   │   │   ├── device-child-views.module.ts
    │   │   │   │   │   │   ├── ml-demo-squeezenet-v1.0

```

Add your custom view to the source/console/src/app/secure/child-views/devices folder, in a new folder of your choice. Example: "my-custom-view"

Name your component. Example: app-my-custom-view



Modify device-child-views.module.ts to add your component and change the template code as follows:

```
...
    template: `
        <div [ngSwitch]="device.deviceBlueprintId" *ngIf="device && device.deviceBlueprintId">
            <app-ml-demo-squeezenet-v1-0 *ngSwitchCase="'ml-demo-squeezenet-v1.0'" [device]="device"></app-ml-demo-squeezenet-v1-0>
            <app-my-custom-view *ngSwitchCase="'[THE DEVICE BLUEPRINT ID FOR YOUR CUSTOM VIEW]'" [device]="device"></app-my-custom-view>
            <app-default-device *ngSwitchDefault [device]="device"></app-default-device>
        </div>
    `
...
```

When sputnik loads your device, it will pass the device information to the child-views component that will present the appropriate view. In this case your custom view, if it matches your specific device blueprint.

## Type 2: "View" widgets in the spec

Coding HTML/Javascript/CSS could be a hassle.

Sputnik comes packaged with a couple widgets (more coming).

* Button
* Card
* Checkbox
* Color Picker
* RealTime Graph
* Input Text
* Text

These widgets are instantiated by the view, when reading the "View" section of a Blueprint's spec.

```
Example: rpi3-sense-hat-demo-v1.0
...
	"View": {
	    "subscriptions": {
	        "shadowGetAccepted": "$aws/things/[THING_NAME]/shadow/get/accepted",
	        "telemetry": "sputnik/[THING_NAME]/telemetry",
	        "shadowUpdateAccepted": "$aws/things/[THING_NAME]/shadow/update/accepted"
	    },
	    "widgets": [{
	            "data": {
	                "text": [{
	                        "data": {
	                            "value": "Temperature:"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "input": [
	                                "telemetry"
	                            ],
	                            "unit": "°C",
	                            "value": "temperature"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "value": "Humidity:"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "input": [
	                                "telemetry"
	                            ],
	                            "unit": "%",
	                            "value": "humidity"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "value": "Pressure:"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "input": [
	                                "telemetry"
	                            ],
	                            "unit": "mb",
	                            "value": "pressure"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "value": "Send Telemetry:"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "output": "$aws/things/[THING_NAME]/shadow/update",
	                            "input": [
	                                "shadowGetAccepted",
	                                "shadowUpdateAccepted"
	                            ],
	                            "initWithShadow": true,
	                            "value": {
	                                "output": "state.desired.sendTelemetry",
	                                "input": "state.desired.sendTelemetry"
	                            }
	                        },
	                        "type": "checkbox",
	                        "class": "col-6 pull-right"
	                    },
	                    {
	                        "data": {
	                            "value": "Joystick is Trigger:"
	                        },
	                        "type": "text",
	                        "class": "col-6"
	                    },
	                    {
	                        "data": {
	                            "output": "$aws/things/[THING_NAME]/shadow/update",
	                            "input": [
	                                "shadowGetAccepted",
	                                "shadowUpdateAccepted"
	                            ],
	                            "initWithShadow": true,
	                            "value": {
	                                "output": "state.desired.joystickIsTrigger",
	                                "input": "state.desired.joystickIsTrigger"
	                            }
	                        },
	                        "type": "checkbox",
	                        "class": "col-6 pull-right"
	                    }
	                ],
	                "title": [{
	                    "data": {
	                        "value": "[DEVICE_NAME]"
	                    },
	                    "type": "text",
	                    "class": "col-12"
	                }]
	            },
	            "type": "card",
	            "class": "col-12 col-md-6"
	        },
	        {
	            "data": {
	                "text": [{
	                        "data": {
	                            "value": "COLOR:"
	                        },
	                        "type": "text",
	                        "class": "col-5"
	                    },
	                    {
	                        "data": {
	                            "output": "sputnik/[THING_NAME]/screen",
	                            "input": [
	                                "shadowGetAccepted",
	                                "shadowUpdateAccepted"
	                            ],
	                            "initWithShadow": true,
	                            "value": {
	                                "output": "screen",
	                                "input": "state.reported.screen"
	                            }
	                        },
	                        "type": "color-picker",
	                        "class": "col-7"
	                    },
	                    {
	                        "data": {
	                            "value": "TEXT:"
	                        },
	                        "type": "text",
	                        "class": "col-5"
	                    },
	                    {
	                        "data": {
	                            "output": "sputnik/[THING_NAME]/screen",
	                            "input": [
	                                "shadowGetAccepted",
	                                "shadowUpdateAccepted"
	                            ],
	                            "initWithShadow": true,
	                            "value": {
	                                "output": "screen",
	                                "input": "state.reported.screen"
	                            }
	                        },
	                        "type": "input-text",
	                        "class": "col-7"
	                    }
	                ],
	                "title": [{
	                    "data": {
	                        "value": "Screen"
	                    },
	                    "type": "text",
	                    "class": "col-12"
	                }]
	            },
	            "type": "card",
	            "class": "col-12 col-md-6"
	        },
	        {
	            "data": {
	                "text": [{
	                    "data": {
	                        "input": [
	                            "telemetry"
	                        ],
	                        "title": "Magnitude",
	                        "value": "magnitude"
	                    },
	                    "type": "graph-realtime",
	                    "class": "col-12"
	                }],
	                "title": [{
	                    "data": {
	                        "value": "Magnitude"
	                    },
	                    "type": "text",
	                    "class": "col-12"
	                }]
	            },
	            "type": "card",
	            "class": "col-lg-6 col-sm-12"
	        }
	    ]
	}
...
```

### Subscriptions
This section descibes where your widgets are pulling their data from.

```
Example: rpi3-sense-hat-demo-v1.0
...
    "subscriptions": {
        "shadowGetAccepted": "$aws/things/[THING_NAME]/shadow/get/accepted",
        "telemetry": "sputnik/[THING_NAME]/telemetry",
        "shadowUpdateAccepted": "$aws/things/[THING_NAME]/shadow/update/accepted"
    },
...
```

You name your subscriptions, and you provide the topic.

```
...
	"subscriptions": {
        "[YOUR SUBSCRIPTION NAME]": "[YOUR SUBSCRIPTION TOPIC]"
   }
...
```

Then, you reference your subscription within the "input" attribute of the given widget.

### Button
```
...
    {
        "data": {
            "output": "hello/world",
            "value": {
                "text": "My Hello Button",
                "output": "my-attribute"
            }
        },
        "type": "button",
        "class": "col-6 pull-right"
    }
...
```
The provided spec will publish to the "hello/world" topic, the following object, when clicking the button:

```
{
  "my-attribute": "click"
}
```

### Card
```
...
    {
        "data": {
            "text": [ARRAY OF WIDGETS],
            "title": [ARRAY OF WIDGETS]
        },
        "type": "card",
        "class": "[CSS CLASS TO USE]"
    }
...
```


### Checkbox
```
Example: rpi3-sense-hat-demo-v1.0
...
	{
	    "data": {
	        "output": "$aws/things/[THING_NAME]/shadow/update",
	        "input": [
	            "shadowGetAccepted",
	            "shadowUpdateAccepted"
	        ],
	        "initWithShadow": true,
	        "value": {
	            "output": "state.desired.sendTelemetry",
	            "input": "state.desired.sendTelemetry"
	        }
	    },
	    "type": "checkbox",
	    "class": "col-6 pull-right"
	}
...
```
For example, this spec will populate a checkbox item. The input, initialized by a Shadow document, will come from the state.desired.sendTelemetry field from the 2 topics shadowGetAccepted and shadowUpdateAccepted (defined by the subscription part of the spec).

The ouptput of the widget, will be pushed to the $aws/things/[THING_NAME]/shadow/update topic, on the state.desired.sendTelemetry field.

### Color Picker
```
Example: rpi3-sense-hat-demo-v1.0
...
	{
        "data": {
            "output": "sputnik/[THING_NAME]/screen",
            "input": [
                "shadowGetAccepted",
                "shadowUpdateAccepted"
            ],
            "initWithShadow": true,
            "value": {
                "output": "screen",
                "input": "state.reported.screen"
            }
        },
        "type": "color-picker",
        "class": "col-7"
    }
...
```
For example, this spec will populate a color picker item. The input, initialized by a Shadow document, will come from the state.reported.screen field from the 2 topics shadowGetAccepted and shadowUpdateAccepted (defined by the subscription part of the spec).

The output of the widget will be published to the sputnik/[THING_NAME]/screen topic, on the screen field.

### RealTime Graph
```
Example: rpi3-sense-hat-demo-v1.0
...
	{
        "data": {
            "input": [
                "telemetry"
            ],
            "title": "Magnitude",
            "value": "magnitude"
        },
        "type": "graph-realtime",
        "class": "col-12"
    }
...
```
For example, this spec will populate a realtime graph. The input will come from the magnitude field of the telemetry topic (specified in the subscription part of the spec).

### Input Text
```
Example: rpi3-sense-hat-demo-v1.0
...
	{
        "data": {
            "output": "sputnik/[THING_NAME]/screen",
            "input": [
                "shadowGetAccepted",
                "shadowUpdateAccepted"
            ],
            "initWithShadow": true,
            "value": {
                "output": "screen",
                "input": "state.reported.screen"
            }
        },
        "type": "input-text",
        "class": "col-7"
    }
...
```
For example, this spec will populate an input text box item. The input, initialized by a Shadow document, will come from the state.reported.screen field from the 2 topics shadowGetAccepted and shadowUpdateAccepted (defined by the subscription part of the spec).

The output of the widget will be published to the sputnik/[THING_NAME]/screen topic, on the screen field.


### Text
```
Example: rpi3-sense-hat-demo-v1.0
...
	{
        "data": {
            "input": [
                "telemetry"
            ],
            "unit": "°C",
            "value": "temperature"
        },
        "type": "text",
        "class": "col-6"
    }
...
```
For example, this spec will populate a text widget. The input will come from the temperature field from the telemetry topic (defined by the subscription part of the spec).

You can also use the Text widget to simply display text:

```
...
	{
        "data": {
            "value": "[TEXT TO DISPLAY]"
        },
        "type": "text",
        "class": "[CSS CLASS TO USE]"
    }
...
```
