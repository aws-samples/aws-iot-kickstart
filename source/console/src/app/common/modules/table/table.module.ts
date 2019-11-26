import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { TableComponent } from './table.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';

@NgModule({
    declarations: [TableComponent],
    exports: [TableComponent],
    imports: [
        CommonModule,

        // Pipes
        PipesModule
    ]
})
export class TableModule {}
