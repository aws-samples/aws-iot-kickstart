import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div class="form-check" style="padding: 0px; margin-bottom: -4px;" (click)="toggle($event)">
            <input type="checkbox" [checked]="value"/>
            <label class="form-check-label" style="padding-left: 25px; width: 100%;">On/Off</label>
        </div>
    `
})

export class CheckboxWidgetComponent extends WidgetComponent {
    public toggle(event) {
        // this.value = !this.value;
        this.setValue(!this.value);
        event.stopPropagation();
        event.preventDefault();
    }
}
