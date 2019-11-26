import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';
import { System } from '@models/system.model';
import { SystemBlueprint } from '@models/system-blueprint.model';

// Services
import { DeviceService } from '@services/device.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';
import { IoTService } from '@services/iot.service';
import { AppSyncService } from '@services/appsync.service';

@Component({
    selector: 'app-default-system',
    template: `
        <app-widgets *ngIf="widgets" [widgets]="widgets" [parent]="parent"></app-widgets>
        <app-device-child-view *ngFor="let device of devices" [device]="device"></app-device-child-view>
    `
})
export class DefaultSystemComponent extends IoTPubSuberComponent implements OnInit {
    @Input() system: System = new System();
    @Input() devices: Device[];

    private widgetSubscriptionSubjects: any = {};
    public widgetSubscriptionObservable$: any = {};

    public widgets: any[];
    public parent: any;

    constructor(private iotService: IoTService, private appSyncService: AppSyncService) {
        super(iotService);
    }

    ngOnInit() {
        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.appSyncService
            .getSystemBlueprint(self.system.systemBlueprintId)
            .then((systemBlueprint: SystemBlueprint) => {
                if (systemBlueprint && systemBlueprint.spec.hasOwnProperty('View')) {
                    self.parent = self;

                    const widgetSubscriptions = [];
                    const view = JSON.parse(
                        JSON.stringify(systemBlueprint.spec.View)
                            .split('[SYSTEM_NAME]')
                            .join(self.system.name)
                    );

                    if (view.hasOwnProperty('subscriptions')) {
                        const subs = view.subscriptions;
                        for (let ref in subs) {
                            if (subs.hasOwnProperty(ref)) {
                                const topic = subs[ref];
                                // console.log('Subscription:', ref, topic);
                                self.widgetSubscriptionSubjects[ref] = new Subject<any>();
                                self.widgetSubscriptionObservable$[
                                    ref
                                ] = self.widgetSubscriptionSubjects[ref].asObservable();
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
                }
            })
            .catch(defaultErrorCallback);
    }
}
