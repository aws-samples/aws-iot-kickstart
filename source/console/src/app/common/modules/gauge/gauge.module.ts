import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GaugeComponent } from './gauge.component';

@NgModule({
    declarations: [GaugeComponent],
    exports: [GaugeComponent],
    imports: [CommonModule],
    providers: []
})
export class GaugeModule {}
