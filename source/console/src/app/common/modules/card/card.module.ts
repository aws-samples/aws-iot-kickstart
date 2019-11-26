import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { CardComponent } from './card.component';

@NgModule({
    declarations: [CardComponent],
    exports: [CardComponent],
    imports: [CommonModule],
    providers: []
})
export class CardModule {}
