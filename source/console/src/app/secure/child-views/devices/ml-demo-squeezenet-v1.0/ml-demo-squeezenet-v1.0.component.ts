import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '@common-secure/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IoTService } from '@services/iot.service';

@Component({
    selector: 'app-ml-demo-squeezenet-v1-0',
    templateUrl: './ml-demo-squeezenet-v1.0.component.html'
})
export class MLDemoSqueezenetV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();
    latestData: any = null;

    constructor(private iotService: IoTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'sputnik/' + this.device.thingName + '/camera',
                onMessage: data => {
                    // console.log('Data:', data.value);
                    this.latestData = data.value;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'sputnik/' + this.device.thingName + '/logger',
                onMessage: data => {
                    // console.log('Logger:', data.value);
                    if (data.value.hasOwnProperty('type') && data.value.type === 'info') {
                        // console.log('INFO:', data.value.payload);
                    }
                    if (data.value.hasOwnProperty('type') && data.value.type === 'exception') {
                        console.error('EXCEPTION:', data.value.payload);
                    }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);
    }
}
