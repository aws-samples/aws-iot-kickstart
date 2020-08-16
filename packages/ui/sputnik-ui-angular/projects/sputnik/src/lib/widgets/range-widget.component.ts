import { Component } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template:
        '<input *ngIf="data" class="form-control-range" type="range" [min]="data.minValue" [max]="data.maxValue" [step]="data.step" [value]="value" (input)="valueChanged($event.target.value)">'
})
export class RangeWidgetComponent extends WidgetComponent {
    public click() {
        this.setValue('click');
    }

    public valueChanged(val) {
        console.log('val', val);
        this.setValue(val);
    }
}
