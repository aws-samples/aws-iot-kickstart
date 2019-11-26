import { Component } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template:
        '<button *ngIf="data" class="btn btn-success" (click)="click()">{{data.value.text}}</button>'
})
export class ButtonWidgetComponent extends WidgetComponent {
    public click() {
        this.setValue('click');
    }
}
