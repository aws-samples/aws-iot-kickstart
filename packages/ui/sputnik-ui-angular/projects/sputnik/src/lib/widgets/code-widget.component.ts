import { Component, Input, OnInit } from '@angular/core'
import { WidgetComponent } from './widget.component'

@Component({
	template: `
		<div *ngIf="data">
			<pre>
				<code [innerHTML]="value"></code>
			</pre>
		</div>
	`,
})
export class CodeWidgetComponent extends WidgetComponent {}
