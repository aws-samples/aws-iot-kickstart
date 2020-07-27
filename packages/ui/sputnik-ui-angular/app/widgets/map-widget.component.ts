import { Component } from '@angular/core'
import { WidgetComponent } from './widget.component'

// TODO: make this dynamic from data
@Component({
	template: '<app-maps [geo]="data.geo"></app-maps>',
})
export class MapWidgetComponent extends WidgetComponent {}
