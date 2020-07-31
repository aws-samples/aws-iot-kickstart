import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import * as echarts from 'echarts'
import { NgxEchartsModule } from 'ngx-echarts'
import { ColorPickerModule } from 'ngx-color-picker'
import { CardModule } from '../modules/card/card.module'
import { GraphLineModule } from '../modules/graph-line/graph-line.module'
import { GaugeModule } from '../modules/gauge/gauge.module'
// Widgets
import { WidgetComponent } from './widget.component'
import { WidgetsComponent } from './widgets.component'
import { ButtonWidgetComponent } from './button-widget.component'
import { CardWidgetComponent } from './card-widget.component'
import { CheckboxWidgetComponent } from './checkbox-widget.component'
import { ColorPickerWidgetComponent } from './color-picker-widget.component'
import { GraphRealtimeWidgetComponent } from './graph-realtime-widget.component'
import { GaugeWidgetComponent } from './gauge-widget.component'
import { InputTextWidgetComponent } from './input-text-widget.component'
import { TextWidgetComponent } from './text-widget.component'
import { MapWidgetComponent } from './map-widget.component'
import { RealTimeDashboardComponent, RealTimeDashboardModule } from './dashboards/realtime/realtime-dashboard'
// Pipes
import { PipesModule } from '../pipes/pipes.module'
import { MapsModule } from '../secure/maps/maps.component'
import { CommandButtonWidgetComponent } from './command-button-widget.component'

@NgModule({
	declarations: [
		WidgetComponent,
		WidgetsComponent,
		ButtonWidgetComponent,
		CardWidgetComponent,
		CheckboxWidgetComponent,
		ColorPickerWidgetComponent,
		GraphRealtimeWidgetComponent,
		GaugeWidgetComponent,
		InputTextWidgetComponent,
		TextWidgetComponent,
		MapWidgetComponent,
		CommandButtonWidgetComponent,
	],
	entryComponents: [
		ButtonWidgetComponent,
		CardWidgetComponent,
		CheckboxWidgetComponent,
		ColorPickerWidgetComponent,
		GraphRealtimeWidgetComponent,
		GaugeWidgetComponent,
		InputTextWidgetComponent,
		TextWidgetComponent,
		MapWidgetComponent,
		CommandButtonWidgetComponent,
		RealTimeDashboardComponent,
	],
	exports: [WidgetsComponent],
	imports: [
		PipesModule,
		CommonModule,
		FormsModule,
		CardModule,
		ColorPickerModule,
		GaugeModule,
		GaugeModule,
		GraphLineModule,
		MapsModule,
		RealTimeDashboardModule,
		NgxEchartsModule.forRoot({
			echarts,
		}),
	],
	// providers: [WidgetsService],
	providers: [],
	schemas: [NO_ERRORS_SCHEMA],
})
export class WidgetsModule {}
