import { EChartOption } from 'echarts'
import { Source } from '../../../services/realtime-data.service/dataset'

export interface GaugeSeries extends EChartOption.SeriesGauge {
	dataSource?: Source
}

export type Series = EChartOption.Series | GaugeSeries

export type ChartOptions = EChartOption<Series>

export interface ChartConfig extends Omit<ChartOptions, 'dataset'> {
	columns?: number
	type?: 'chart' | 'geo'
}

export interface DashboardConfig {
	columns?: number
	charts: ChartConfig[]
}
