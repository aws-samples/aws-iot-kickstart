import { Component, Input, OnDestroy } from '@angular/core'
import { Subscription, Subject } from 'rxjs'
import { Device } from '../../models/device.model'
// Services
import { IoTService } from '../../services/iot.service'
import { mixin } from 'underscore'
import * as _ from 'underscore'
import underscoreDeepExtend from 'underscore-deep-extend'

mixin({ deepExtend: underscoreDeepExtend(_) })

export class IoTSubscription {
	topic: string;

	onMessage: (data: any) => void;

	onError: (data: any) => void;
}

@Component({
	selector: 'app-root-iot-pubsuber',
	template: '',
})
export class IoTPubSuberComponent implements OnDestroy {
	private _subscriptions: Subscription = new Subscription();

	private _iotSubscriptions: IoTSubscription[];

	@Input() device: Device = new Device();

	private subscriptionsSubject: any = new Subject<boolean>();

	public subscriptionsObservable$ = this.subscriptionsSubject.asObservable();

	protected shadow: any = {};

	constructor (private _iotService: IoTService) {}

	ngOnDestroy () {
		console.log('Unsubscribing to topics')
		this._subscriptions.unsubscribe()
	}

	protected subscribe (_iotSubscriptions: IoTSubscription[]) {
		this._iotSubscriptions = _iotSubscriptions
		this._iotService.connectionObservable$.subscribe((connected: boolean) => {
			console.log('Change of connection state: setting _subscriptions')
			this.setSubscriptions()
		})
		this.setSubscriptions()
	}

	private setSubscriptions () {
		if (this._iotService.isConnected) {
			this._iotSubscriptions.forEach((sub: IoTSubscription) => {
				console.log('Subscribing to topic:', sub.topic)
				this._subscriptions.add(this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError))
			})
			this.subscriptionsSubject.next()
		} else {
			console.log('Not connected to AWS IoT: Can\'t subscribe')
		}
	}
}
