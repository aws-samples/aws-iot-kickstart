import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';

// Components
import { GraphLineComponent } from './graph-line.component';

@NgModule({
    declarations: [GraphLineComponent],
    exports: [GraphLineComponent],
    imports: [CommonModule, ChartsModule],
    providers: [ChartsModule]
})
export class GraphLineModule {}
