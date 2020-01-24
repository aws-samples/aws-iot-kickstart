import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TestsComponent } from './tests.component';

import { CardModule } from '../../common/modules/card/card.module';
import { GaugeModule } from '../../common/modules/gauge/gauge.module';
import { WidgetsModule } from '@app/widgets/widgets.module';

// Pipes
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [TestsComponent],
    exports: [TestsComponent],
    imports: [PipesModule, CommonModule, FormsModule, WidgetsModule, GaugeModule, CardModule],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class TestsModule {}
