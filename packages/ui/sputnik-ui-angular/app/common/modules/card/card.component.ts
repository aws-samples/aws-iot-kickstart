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
	@ContentChild('header', { static: true }) header: ElementRef;

	@ContentChild('footer', { static: true }) footer: ElementRef;

	@ContentChild('title', { static: true }) title: ElementRef;

	@ContentChild('subtitle', { static: true }) subtitle: ElementRef;

	@ContentChild('text', { static: true }) text: ElementRef;

	constructor () {}
}
