import { Component, Input } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <app-card>
            <card-header *ngIf="data.header" #header>
                <app-widgets [widgets]="data.header" [parent]="parent"></app-widgets>
            </card-header>
            <card-title *ngIf="data.title" #title>
                <app-widgets [widgets]="data.title" [parent]="parent"></app-widgets>
            </card-title>
            <card-subtitle *ngIf="data.subtitle" #subtitle>
                <app-widgets [widgets]="data.subtitle" [parent]="parent"></app-widgets>
            </card-subtitle>
            <card-text *ngIf="data.text" #text>
                <app-widgets [widgets]="data.text" [parent]="parent"></app-widgets>
            </card-text>
            <card-footer *ngIf="data.footer" #footer>
                <app-widgets [widgets]="data.footer" [parent]="parent"></app-widgets>
            </card-footer>
        </app-card>
    `
})
export class CardWidgetComponent extends WidgetComponent {}
