import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';
import { Subject } from 'rxjs';

@Component({
    template: `
        <app-graph-line
            class="col-lg-6 col-md-12"
            [title]="data.title"
            [value]="newvalue"
            type="realtime"
        ></app-graph-line>
    `
})
export class GraphRealtimeWidgetComponent extends WidgetComponent {

    newvalue: Subject<any> = new Subject();

    // Override parent
    set value(val: any) {
        this.newvalue.next(val);
    }
}
