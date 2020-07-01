import { Component } from '@angular/core'
import { WidgetComponent } from './widget.component'

@Component({
	template: `
        <input
            [style.background]="htmlvalue"
            [cpOKButton]="true"
            [cpSaveClickOutside]="false"
            [cpOKButtonClass]="'btn btn-primary btn-xs'"
            [(colorPicker)]="htmlvalue"
            (colorPickerSelect)="updateHtmlValue()"
            [cpPosition]="'bottom'"
            style="height: 21px"
        />
    `,
})

export class ColorPickerWidgetComponent extends WidgetComponent {
	private rgbToHex (rgb) {
		let hex = Number(rgb).toString(16)

		if (hex.length < 2) {
			hex = '0' + hex
		}

		return hex
	}

	private fullColorHex (rgb) {
		return '#' + this.rgbToHex(rgb.r) + this.rgbToHex(rgb.g) + this.rgbToHex(rgb.b)
	}

	get htmlvalue () {
		if (this.value.hasOwnProperty('r') && this.value.hasOwnProperty('g') && this.value.hasOwnProperty('b')) {
			return this.fullColorHex(this.value)
		} else {
			return '#000000'
		}
	}

	set htmlvalue (val: any) {
		this.value = {
			r: parseInt(val.substring(1, 3), 16),
			g: parseInt(val.substring(3, 5), 16),
			b: parseInt(val.substring(5, 7), 16),
		}
	}

	public updateHtmlValue () {
		this.setValue(this.value)
	}
}
