import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';
import { DeviceBlueprint } from '@models/device-blueprint.model';

// Services
import { IoTService } from '@services/iot.service';
import { AppSyncService } from '@services/appsync.service';

@Component({
    selector: 'app-default-device',
    template: `
        <app-widgets *ngIf="widgets" [widgets]="widgets" [parent]="parent"></app-widgets>
    `
})
export class DefaultDeviceComponent extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    private widgetSubscriptionSubjects: any = {};
    public widgetSubscriptionObservable$: any = {};

    constructor(private iotService: IoTService, private appSyncService: AppSyncService) {
        super(iotService);
    }

    public widgets: any[];
    public parent: any;

    ngOnInit() {
        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.appSyncService
            .getDeviceBlueprint(self.device.deviceBlueprintId)
            .then((deviceBlueprint: DeviceBlueprint) => {
                if (deviceBlueprint && deviceBlueprint.spec.hasOwnProperty('View')) {
                    self.parent = self;

                    self.iotService
                        .getThingShadow({
                            thingName: self.device.thingName
                        })
                        .then((shadow: any) => {
                            self.shadow = shadow;

                            const widgetSubscriptions = [];
                            const view = JSON.parse(
                                JSON.stringify(deviceBlueprint.spec.View)
                                    .split('[CORE]')
                                    .join(self.device.thingName)
                                    .split('[THING_NAME]')
                                    .join(self.device.thingName)
                                    .split('[DEVICE_NAME]')
                                    .join(self.device.name)
                            );

                            if (view.hasOwnProperty('subscriptions')) {
                                const subs = view.subscriptions;
                                for (let ref in subs) {
                                    if (subs.hasOwnProperty(ref)) {
                                        const topic = subs[ref];
                                        // console.log('Subscription:', ref, topic);
                                        self.widgetSubscriptionSubjects[ref] = new Subject<any>();
                                        self.widgetSubscriptionObservable$[ref] = self.widgetSubscriptionSubjects[
                                            ref
                                        ].asObservable();
                                        widgetSubscriptions.push({
                                            topic: topic,
                                            onMessage: message => {
                                                // console.log('onMessage:', topic, message);
                                                self.widgetSubscriptionSubjects[ref].next(message.value);
                                            },
                                            onError: defaultErrorCallback
                                        });
                                    }
                                }
                            }

                            self.subscribe(widgetSubscriptions);

                            if (view.hasOwnProperty('widgets')) {
                                self.widgets = view.widgets;
                            }
                        });
                }
            })
            .catch(defaultErrorCallback);
    }
}
