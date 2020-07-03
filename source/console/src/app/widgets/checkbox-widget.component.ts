import { Component, Input, OnInit } from '@angular/core'
import { WidgetComponent } from './widget.component'

@Component({
	template: `
        <div class="form-check" style="padding: 0px; margin-bottom: -4px;" (click)="toggle($event)">
            <input type="checkbox" [checked]="toggleValue"/>
            <label class="form-check-label" style="padding-left: 25px; width: 100%;">On/Off</label>
        </div>
    `,
})

export class CheckboxWidgetComponent extends WidgetComponent {
	public toggle (event) {
		let outputValue = false

		if (this.data.hasOwnProperty('toggleTrue') && this.data.hasOwnProperty('toggleFalse')) {
			if (this.value === this.data.toggleTrue) {
				this.setValue(this.data.toggleFalse)
			} else if (this.value === this.data.toggleFalse) {
				this.setValue(this.data.toggleTrue)
			}
		} else {
			this.setValue(!this.value) // Assume direct boolean type value: true/false
		}
		event.stopPropagation()
		event.preventDefault()
	}

	get toggleValue () {
		if (this.data.hasOwnProperty('toggleTrue') && this.data.hasOwnProperty('toggleFalse')) {
			if (this.value === this.data.toggleTrue) {
				return true
			} else if (this.value === this.data.toggleFalse) {
				return false
			} else {
				return false
			}
		} else {
			return this.value
		}
	}
}
