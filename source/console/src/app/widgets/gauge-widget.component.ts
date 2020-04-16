import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { WidgetComponent } from './widget.component';

@Component({
    template: '<app-gauge [minValue]="data.minValue" [maxValue]="data.maxValue" [value]="value" animationSpeed="45"></app-gauge>'
})

export class GaugeWidgetComponent extends WidgetComponent {
}
