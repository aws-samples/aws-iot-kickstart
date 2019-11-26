import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';

import { Device } from '@models/device.model';

// Services
import { IoTService } from '@services/iot.service';

import { _ } from 'underscore';
import * as underscoreDeepExtend from 'underscore-deep-extend';

_.mixin({ deepExtend: underscoreDeepExtend(_) });

export class IoTSubscription {
    topic: string;
    onMessage: (data: any) => void;
    onError: (data: any) => void;
}

export interface IoTPubSuber {
    device: Device;

    desired: any;
    reported: any;
    delta: any;

    updateDesiredShadow(thingName: string, desiredState: any): Promise<void>;
}


@Component({
    selector: 'app-root-iot-pubsuber',
    template: ''
})
export class IoTPubSuberComponent implements OnDestroy, IoTPubSuber {
    private _subscriptions: Subscription = new Subscription();
    private _iotSubscriptions: IoTSubscription[];

    @Input() device: Device = new Device();

    public desired: any = {};
    public reported: any = {};
    public delta: any = {};
    public shadow: any = {};

    private subscriptionsSubject: any = new Subject<boolean>();
    public subscriptionsObservable$ = this.subscriptionsSubject.asObservable();

    constructor(private _iotService: IoTService) {}

    ngOnDestroy() {
        console.log('Unsubscribing to topics');
        this._subscriptions.unsubscribe();
    }

    protected subscribe(_iotSubscriptions: IoTSubscription[]) {
        this._iotSubscriptions = _iotSubscriptions;
        this._iotService.connectionObservable$.subscribe((connected: boolean) => {
            console.log('Change of connection state: setting _subscriptions');
            this.setSubscriptions();
        });
        this.setSubscriptions();
    }

    private setSubscriptions() {
        if (this._iotService.isConnected) {
            this._iotSubscriptions.forEach((sub: IoTSubscription) => {
                console.log('Subscribing to topic:', sub.topic);
                this._subscriptions.add(this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
            });
            this.subscriptionsSubject.next();
        } else {
            console.log('Not connected to AWS IoT: Cant subscribe');
        }
    }
    protected updateIncomingShadow(incoming, shadowField = null) {

        _.deepExtend(this.shadow, incoming);

        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('reported')) {
            if (shadowField !== null && incoming.state.reported.hasOwnProperty(shadowField)) {
                _.deepExtend(this.reported, incoming.state.reported[shadowField]);
            } else {
                _.deepExtend(this.reported, incoming.state.reported);
            }
        }
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('desired')) {
            if (shadowField !== null && incoming.state.desired.hasOwnProperty(shadowField)) {
                _.deepExtend(this.desired, incoming.state.desired[shadowField]);
            } else {
                _.deepExtend(this.desired, incoming.state.desired);
            }
        }
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('delta')) {
            this.delta = incoming.state.delta;
        }
    }

    protected getLastState(thingName, shadowField = null) {
        return this._iotService
            .getThingShadow({
                thingName: thingName
            })
            .then(result => {
                this.updateIncomingShadow(result, shadowField);
                return result;
            })
            .catch(err => {
                console.error(err);
                throw err;
            });
    }

    updateDesiredShadow(thingName, desiredState) {
        return this._iotService.updateThingShadow({
            thingName: thingName,
            payload: JSON.stringify({
                state: {
                    desired: desiredState
                }
            })
        });
    }
}
