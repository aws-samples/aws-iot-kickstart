import { Component, ContentChild, ElementRef } from '@angular/core'

@Component({
	selector: 'app-card',
	template: `
	<div class="card card-outline-info">
		<div class="card-header" *ngIf="header">
			<ng-content select="card-header"></ng-content>
		</div>
		<div class="card-body">
			<h5 class="card-title" *ngIf="title">
				<ng-content select="card-title"></ng-content>
			</h5>
			<h6 class="card-subtitle mb-2 text-muted" *ngIf="subtitle">
				<ng-content select="card-subtitle"></ng-content>
			</h6>
			<div class="card-text" *ngIf="text">
				<ng-content select="card-text"></ng-content>
			</div>
		</div>
		<div class="card-footer" *ngIf="footer">
			<ng-content select="card-footer"></ng-content>
		</div>
	</div>
	`,
})
export class CardComponent {
	@ContentChild('header', { static: false }) header: ElementRef;

	@ContentChild('footer', { static: false }) footer: ElementRef;

	@ContentChild('title', { static: false }) title: ElementRef;

	@ContentChild('subtitle', { static: false }) subtitle: ElementRef;

	@ContentChild('text', { static: false }) text: ElementRef;

	constructor () {}
}
