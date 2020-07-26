import { Component } from '@angular/core'
import { WidgetComponent } from './widget.component'

@Component({
	template:
				'<button *ngIf="data" class="btn btn-success" (click)="click()">{{data.label}}</button>',
})
export class CommandButtonWidgetComponent extends WidgetComponent {
	public click () {
		const { topic, payload } = this.data

		console.info('command:', topic, payload)
		this.parent.iotService.publish(topic, payload)
	}
}
