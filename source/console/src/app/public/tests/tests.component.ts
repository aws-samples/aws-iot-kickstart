import { Component, OnInit } from '@angular/core';

// import { }
import { IoTPubSuberComponent, IoTPubSuber } from '@secure/common/iot-pubsuber.component';
import { IoTService } from '@services/iot.service';
import { Device } from '@models/device.model';

@Component({
    selector: 'app-tests',
    template: `
        <app-widgets [widgets]="widgets" [parent]="self" style="color: black;"></app-widgets>
    `
})
export class TestsComponent extends IoTPubSuberComponent implements OnInit {
    public title = 'Tests';
    public self: any;
    public widgets: any;

    public desired = {
        led: ['#FF0000', '#00FF00', '#0000FF', '#F0F0F0', '#0F0F0F']
    };

    constructor(private iotService: IoTService) {
        super(iotService);
    }

    ngOnInit() {
        this.self = this;
        // this.subscriptions =
        this.widgets = [
            {
                data: {
                    text: [
                        {
                            data: {
                                value: 'LEDs'
                            },
                            type: 'text',
                            class: 'col-12'
                        },
                        {
                            data: {
                                value: 'LED 0'
                            },
                            type: 'text',
                            class: 'col-3'
                        },
                        {
                            data: {
                                type: 'shadow',
                                value: 'desired.led[0]'
                            },
                            type: 'color-picker',
                            class: 'col-9'
                        },
                        {
                            data: {
                                value: 'LED 1'
                            },
                            type: 'text',
                            class: 'col-3'
                        },
                        {
                            data: {
                                type: 'shadow',
                                value: 'desired.led[1]'
                            },
                            type: 'color-picker',
                            class: 'col-9'
                        },
                        {
                            data: {
                                value: 'LED 2'
                            },
                            type: 'text',
                            class: 'col-3'
                        },
                        {
                            data: {
                                type: 'shadow',
                                value: 'desired.led[2]'
                            },
                            type: 'color-picker',
                            class: 'col-9'
                        },
                        {
                            data: {
                                value: 'LED 3'
                            },
                            type: 'text',
                            class: 'col-3'
                        },
                        {
                            data: {
                                type: 'shadow',
                                value: 'desired.led[3]'
                            },
                            type: 'color-picker',
                            class: 'col-9'
                        },
                        {
                            data: {
                                value: 'LED 4'
                            },
                            type: 'text',
                            class: 'col-3'
                        },
                        {
                            data: {
                                type: 'shadow',
                                value: 'desired.led[4]'
                            },
                            type: 'color-picker',
                            class: 'col-9'
                        }
                    ],
                    title: [
                        {
                            data: {
                                value: 'Peripherals 1'
                            },
                            type: 'text',
                            class: 'col-12'
                        }
                    ]
                },
                type: 'card',
                class: 'col-lg-4 col-sm-12'
            },
            {
                data: {
                    text: [
                        {
                            data: {
                                type: 'subscription',
                                subscription: 'sub0',
                                value: 'sensors.magnitude'
                            },
                            type: 'graph-realtime',
                            class: 'col-12'
                        }
                    ],
                    title: [
                        {
                            data: {
                                value: 'Peripherals 2'
                            },
                            type: 'text',
                            class: 'col-12'
                        }
                    ]
                },
                type: 'card',
                class: 'col-lg-8 col-sm-12'
            }
        ];
    }
}
