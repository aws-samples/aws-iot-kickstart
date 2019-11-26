import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: '<div *ngIf="data">{{ value }}{{ data.unit }}</div>'
})
export class TextWidgetComponent extends WidgetComponent {}
