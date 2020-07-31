import { isString } from 'underscore'
import { Input, Component, OnInit, NgModule, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EChartOption } from 'echarts'
import { NgxEchartsModule } from 'ngx-echarts'
import { RealTimeDataService } from '../../../services/realtime-data/service'
import { GaugeSeries } from './ChartConfig'

@Component({
	selector: 'chart',
	template: '<div echarts *ngIf="options" [options]="options" (chartInit)="onChartInit($event)" [title]="title"></div>',
})
export class ChartComponent implements OnInit, OnChanges {
	protected instance: any

	options: EChartOption

	@Input() title?: string

	@Input() config: EChartOption

	onChartInit (instance) {
		this.instance = instance
	}

	constructor (protected readonly realtimeDataService: RealTimeDataService) {}

	ngOnInit () {
		this.realtimeDataService.datasetObservable.subscribe(dataset => {
			this.mapConfig()

			this.options = {
				dataset,
				...this.config,
			}
		})
	}

	ngOnChanges (changes: SimpleChanges) {
		// this.options = {
		//	dataset: changes.dataset.currentValue,
		//	...changes.config.currentValue,
		// }
	}

	protected mapConfig (): void {
		// Map datasetIndex name to actual index
		this.config.series && this.config.series.forEach((series) => {
			if (isString((series as any).datasetIndex)) {
				(series as any).datasetIndex = this.realtimeDataService.getDatasetIndex((series as any).datasetIndex)
			}

			// Guage does not support dataset, so we added 'source' property to that type to map to value
			switch (series.type) {
				case 'gauge': {
					const gauge = series as GaugeSeries

					if (gauge.dataSource && this.realtimeDataService.ready) {
						gauge.data = this.realtimeDataService.getSourceValue(gauge.dataSource)
					}

					if (!Array.isArray(gauge.data)) {
						gauge.data = [gauge.data]
					}
					break
				}
			}
		})
	}
}

@NgModule({
	declarations: [
		ChartComponent,
	],
	exports: [
		ChartComponent,
	],
	imports: [
		CommonModule,
		NgxEchartsModule.forChild(),
	],
	providers: [],
})
export class ChartModule {}
