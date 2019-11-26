import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <app-graph-line
            class="col-lg-6 col-md-12"
            [title]="data.title"
            [value]="value"
            type="realtime"
        ></app-graph-line>
    `
})
export class GraphRealtimeWidgetComponent extends WidgetComponent {}
