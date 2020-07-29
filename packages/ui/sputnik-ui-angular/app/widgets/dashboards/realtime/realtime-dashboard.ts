import { Component, NgZone, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IoTService } from '../../../services/iot.service'
import { PipesModule } from '../../../pipes/pipes.module'
import { ChartModule } from './chart'
import { WidgetComponent } from '../../widget.component'
import { RealTimeDataService } from '../../../services/realtime-data.service'
import { ChartConfig, DashboardConfig } from './ChartConfig'
import { MapboxModule } from './mapbox'

@Component({
	selector: 'realtime-dashboard',
	templateUrl: './realtime-dashboard.html',
	styleUrls: ['./realtime-dashboard.css'],
})
export class RealTimeDashboardComponent extends WidgetComponent {
	public charts: ChartConfig[]

	get config (): DashboardConfig {
		return this.data as DashboardConfig
	}

	constructor (
		protected readonly realtimeDataService: RealTimeDataService,
		protected readonly iotService: IoTService,
		protected readonly ngZone: NgZone,
	) {
		super()
	}

	ngOnInit () {
		this.realtimeDataService.getEvents(this.device.namespace, this.device.thingName)

		this.renderCharts()
	}

	protected renderCharts (): void {
		this.charts = this.data.charts as ChartConfig[]

		console.log('ReatTimeDashboard:charts:', this.charts)
	}
}

@NgModule({
	declarations: [
		RealTimeDashboardComponent,
	],
	exports: [
		RealTimeDashboardComponent,
	],
	imports: [
		PipesModule,
		CommonModule,
		ChartModule,
		MapboxModule,
	],
	providers: [],
})
export class RealTimeDashboardModule {}
