import { Component, ContentChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html'
})
export class CardComponent {
    @ContentChild('header') header: ElementRef;
    @ContentChild('footer') footer: ElementRef;
    @ContentChild('title') title: ElementRef;
    @ContentChild('subtitle') subtitle: ElementRef;
    @ContentChild('text') text: ElementRef;

    constructor() {}
}
