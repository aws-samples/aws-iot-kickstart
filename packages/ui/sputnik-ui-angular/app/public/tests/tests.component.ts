import { Component, OnInit } from '@angular/core'
import { Observable, Subject } from 'rxjs'
// import { }
import { IoTPubSuberComponent } from '@deathstar/sputnik-ui-angular/app/secure/common/iot-pubsuber.component'
import { IoTService } from '@deathstar/sputnik-ui-angular/app/services/iot.service'
import { Device } from '@deathstar/sputnik-ui-angular/app/models/device.model'

// <app-widgets [widgets]="widgets" [parent]="self" style="color: black;"></app-widgets>
// <div class="row">
//		<div class="col-12 text-center">
//				Yo
//		</div>
//		<div class="col-12 text-center">
//				<app-gauge id="speed" minValue="0" maxValue="30" [value]="temperature" animationSpeed="45"></app-gauge>
//		</div>
// </div>

@Component({
	selector: 'app-tests',
	template: `
				<div class="row">
						<div class="col-3 text-center">
								<app-gauge minValue=0 maxValue=31 [value]="temperature" animationSpeed=45></app-gauge>
						</div>
				</div>
				<div class="row">
						<div class="col-3 text-center">
								<app-card>
										<card-title #title>Test</card-title>
										<card-text #text>
												<div class="row">
														<div class="col-12 text-center">
																<app-gauge minValue=0 maxValue=30 [value]="temperature" animationSpeed=45></app-gauge>
														</div>
												</div>
										</card-text>
								</app-card>
						</div>
				</div>
				<app-widgets [widgets]="widgets" [parent]="self" style="color: black;"></app-widgets>
		`,
})

// <app-widgets [widgets]="widgets" [parent]="self" style="color: black;"></app-widgets>
export class TestsComponent extends IoTPubSuberComponent implements OnInit {
		public title = 'Tests';

		public self: any;

		public widgets: any;

		private widgetSubscriptionSubjects: any = {};

		public widgetSubscriptionObservable$: any = {};

		public desired = {
			led: ['#FF0000', '#00FF00', '#0000FF', '#F0F0F0', '#0F0F0F'],
		};

		public temperature = 0;

		constructor (private iotService: IoTService) {
			super(iotService)
			this.iotService.publish = function (topic: string, payload: any) {
				console.log('Test publish', topic, payload)

				return Promise.resolve([])
			}
		}

		ngOnInit () {
			this.self = this

			function defaultErrorCallback (err) {
				console.error('Error:', err)
			}

			const subs = {
				test: 'topicname',
				shadow: 'topicname',
			}

			for (const ref in subs) {
				if (subs.hasOwnProperty(ref)) {
					const topic = subs[ref]
					// console.log('Subscription:', ref, topic);
					this.widgetSubscriptionSubjects[ref] = new Subject<any>()
					this.widgetSubscriptionObservable$[ref] = this.widgetSubscriptionSubjects[
					ref
					].asObservable()
				}
			}

			setInterval(() => {
				this.temperature = Math.random()
				this.widgetSubscriptionSubjects.test.next({
					temperature: this.temperature,
				})
			}, 1000)

			setTimeout(() => {
				this.widgetSubscriptionSubjects.shadow.next({
					toggle: '1',
				})
			}, 1000)

			this.widgets = [
				{
					data: {
						input: [
							'test',
						],
						minValue: 0,
						initWithShadow: true,
						maxValue: 50,
						value: {
							input: 'temperature',
						},
					},
					type: 'gauge',
					class: 'col-3 text-center',
				},
				{
					data: {
						text: [
							{
								data: {
									input: [
										'test',
									],
									minValue: 0,
									initWithShadow: true,
									maxValue: 50,
									value: {
										input: 'temperature',
									},
								},
								type: 'gauge',
								class: 'col-12 text-center',
							},
						],
						title: [
							{
								data: {
									value: 'Temperature',
								},
								type: 'text',
								class: 'col-12 text-center',
							},
						],
					},
					type: 'card',
					class: 'col-lg-3 col-sm-12',
				},
			// {
			//		data: {
			//				title: [
			//						{
			//								data: {
			//										value: 'Hello'
			//								},
			//								type: 'text',
			//								class: 'col-12'
			//						}
			//				],
			//				text: [
			//						{
			//								"data": {
			//										"input": [
			//												"test"
			//										],
			//										"unit": " C",
			//										"value": "temperature"
			//								},
			//								"type": "text",
			//								"class": "col-12"
			//						},
			//						{
			//								"data": {
			//										"value": "Toggle:"
			//								},
			//								"type": "text",
			//								"class": "col-6"
			//						},
			//						{
			//								"data": {
			//										"output": "$aws/things/[THING_NAME]/shadow/update",
			//										"input": [
			//												"shadow"
			//										],
			//										"initWithShadow": true,
			//										"toggleTrue": '1',
			//										"toggleFalse": '0',
			//										"value": {
			//												"output": "state.desired.toggle",
			//												"input": "toggle"
			//										}
			//								},
			//								"type": "checkbox",
			//								"class": "col-6 pull-right"
			//						}
			//				]
			//		},
			//		type: 'card',
			//		class: 'col-lg-12',
			//		id: 'widget1'
			// },
			// {
			//		data: {
			//				text: [
			//						{
			//								data: {
			//										value: 'LEDs'
			//								},
			//								type: 'text',
			//								class: 'col-12'
			//						},
			//						{
			//								data: {
			//										value: 'LED 0'
			//								},
			//								type: 'text',
			//								class: 'col-3'
			//						},
			//						{
			//								data: {
			//										type: 'shadow',
			//										value: 'desired.led[0]'
			//								},
			//								type: 'color-picker',
			//								class: 'col-9'
			//						},
			//						{
			//								data: {
			//										value: 'LED 1'
			//								},
			//								type: 'text',
			//								class: 'col-3'
			//						},
			//						{
			//								data: {
			//										type: 'shadow',
			//										value: 'desired.led[1]'
			//								},
			//								type: 'color-picker',
			//								class: 'col-9'
			//						},
			//						{
			//								data: {
			//										value: 'LED 2'
			//								},
			//								type: 'text',
			//								class: 'col-3'
			//						},
			//						{
			//								data: {
			//										type: 'shadow',
			//										value: 'desired.led[2]'
			//								},
			//								type: 'color-picker',
			//								class: 'col-9'
			//						},
			//						{
			//								data: {
			//										value: 'LED 3'
			//								},
			//								type: 'text',
			//								class: 'col-3'
			//						},
			//						{
			//								data: {
			//										type: 'shadow',
			//										value: 'desired.led[3]'
			//								},
			//								type: 'color-picker',
			//								class: 'col-9'
			//						},
			//						{
			//								data: {
			//										value: 'LED 4'
			//								},
			//								type: 'text',
			//								class: 'col-3'
			//						},
			//						{
			//								data: {
			//										type: 'shadow',
			//										value: 'desired.led[4]'
			//								},
			//								type: 'color-picker',
			//								class: 'col-9'
			//						}
			//				],
			//				title: [
			//						{
			//								data: {
			//										value: 'Peripherals 1'
			//								},
			//								type: 'text',
			//								class: 'col-12'
			//						}
			//				]
			//		},
			//		type: 'card',
			//		class: 'col-lg-4 col-sm-12',
			//		id: 'widget2'
			// },
			// {
			//		data: {
			//				text: [
			//						{
			//								data: {
			//										type: 'subscription',
			//										subscription: 'sub0',
			//										value: 'sensors.magnitude'
			//								},
			//								type: 'graph-realtime',
			//								class: 'col-12'
			//						}
			//				],
			//				title: [
			//						{
			//								data: {
			//										value: 'Peripherals 2'
			//								},
			//								type: 'text',
			//								class: 'col-12'
			//						}
			//				]
			//		},
			//		type: 'card',
			//		class: 'col-lg-8 col-sm-12',
			//		id: 'widget3'
			// }
			]
		}
}
