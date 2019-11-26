import { Component, Input } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <app-card>
            <card-header #header *ngIf="data.header">
                <app-widgets [widgets]="data.header" [parent]="parent"></app-widgets>
            </card-header>
            <card-title #title *ngIf="data.title">
                <app-widgets [widgets]="data.title" [parent]="parent"></app-widgets>
            </card-title>
            <card-subtitle #subtitle *ngIf="data.subtitle">
                <app-widgets [widgets]="data.subtitle" [parent]="parent"></app-widgets>
            </card-subtitle>
            <card-text #text *ngIf="data.text">
                <app-widgets [widgets]="data.text" [parent]="parent"></app-widgets>
            </card-text>
            <card-footer #footer *ngIf="data.footer">
                <app-widgets [widgets]="data.footer" [parent]="parent"></app-widgets>
            </card-footer>
        </app-card>
    `
})
export class CardWidgetComponent extends WidgetComponent {}
