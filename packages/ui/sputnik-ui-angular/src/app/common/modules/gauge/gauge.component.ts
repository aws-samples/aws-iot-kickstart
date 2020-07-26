import { Component, Input, AfterViewInit, ElementRef, ContentChild, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'

declare let Gauge: any

@Component({
	selector: 'app-gauge',
	template: '<canvas #gauge class="gaugejs" style="width: 100%"></canvas>',
})
export class GaugeComponent implements AfterViewInit {
		private gauge = null;

		@Input() set value (val: number) {
			if (this.gauge) {
			// console.log('Gauge: set:', val);
				this.gauge.set(val)
			}
		}

		@ViewChild('gauge', { static: true }) gaugeElement: ElementRef;

		@Input() opts: any;

		@Input() maxValue: number;

		@Input() minValue: number;

		@Input() animationSpeed: number;

		constructor () {}

		ngAfterViewInit () {
			setTimeout(() => {
			// Needed to run it after full init of the view.
				if (!this.opts) {
					this.opts = {
						angle: 0,
						lineWidth: 0.42,
						radiusScale: 1,
						pointer: { length: 0.64, strokeWidth: 0.04, color: '#000000' },
						limitMax: false,
						limitMin: false,
						colorStart: '#009efb',
						colorStop: '#009efb',
						strokeColor: '#E0E0E0',
						generateGradient: true,
						highDpiSupport: true,
						staticLabels: {
							font: '10px sans-serif', // Specifies font
							labels: [(this.minValue || 0) / 1, (this.maxValue || 0) / 1], // Print labels at these values
							color: '#000000', // Optional: Label text color
							fractionDigits: 0, // Optional: Numerical precision. 0=round off.
						},
					}
				}
				const target = <HTMLCanvasElement> this.gaugeElement.nativeElement
				this.gauge = new Gauge(target).setOptions(this.opts) // create sexy gauge!
				this.gauge.maxValue = this.maxValue || 0
				this.gauge.setMinValue(this.minValue || 0)
				this.gauge.animationSpeed = this.animationSpeed || 0
				this.gauge.set(this.minValue)
			}, 0)
		}
}
