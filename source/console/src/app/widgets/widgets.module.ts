import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';
import { CardModule } from '../common/modules/card/card.module';
import { GraphLineModule } from '../common/modules/graph-line/graph-line.module';
import { GaugeModule } from '../common/modules/gauge/gauge.module';

// Widgets
import { WidgetComponent } from './widget.component';
import { WidgetsComponent } from './widgets.component';
import { ButtonWidgetComponent } from './button-widget.component';
import { CardWidgetComponent } from './card-widget.component';
import { CheckboxWidgetComponent } from './checkbox-widget.component';
import { ColorPickerWidgetComponent } from './color-picker-widget.component';
import { GraphRealtimeWidgetComponent } from './graph-realtime-widget.component';
import { InputTextWidgetComponent } from './input-text-widget.component';
import { TextWidgetComponent } from './text-widget.component';

// Pipes
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
    declarations: [
        WidgetComponent,
        WidgetsComponent,
        ButtonWidgetComponent,
        CardWidgetComponent,
        CheckboxWidgetComponent,
        ColorPickerWidgetComponent,
        GraphRealtimeWidgetComponent,
        InputTextWidgetComponent,
        TextWidgetComponent
    ],
    entryComponents: [
        ButtonWidgetComponent,
        CardWidgetComponent,
        CheckboxWidgetComponent,
        ColorPickerWidgetComponent,
        GraphRealtimeWidgetComponent,
        InputTextWidgetComponent,
        TextWidgetComponent
    ],
    exports: [WidgetsComponent],
    imports: [PipesModule, CommonModule, FormsModule, CardModule, ColorPickerModule, GaugeModule, GraphLineModule],
    // providers: [WidgetsService],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class WidgetsModule {}
