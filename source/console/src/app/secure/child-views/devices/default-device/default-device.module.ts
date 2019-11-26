import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DefaultDeviceComponent } from './default-device.component';

import { WidgetsModule } from '@app/widgets/widgets.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [DefaultDeviceComponent],
    exports: [DefaultDeviceComponent],
    imports: [PipesModule, CommonModule, FormsModule, WidgetsModule],
    providers: [],
    schemas: []
})
export class DefaultDeviceModule {}
