import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TestsComponent } from './tests.component';

import { WidgetsModule } from '@app/widgets/widgets.module';

// Pipes
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [TestsComponent],
    exports: [TestsComponent],
    imports: [PipesModule, CommonModule, FormsModule, WidgetsModule],
    providers: [],
    schemas: []
})
export class TestsModule {}
