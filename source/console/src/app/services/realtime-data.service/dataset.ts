import { last, isNumber } from 'underscore'
import { EChartOption } from 'echarts'
import { IoTEvent, IoTEventData } from '../../models/iot-event.model'

export interface Source {
	dataset: number | string
	encode: {
		/**
		 * X dimension
		 */
		x: {
			dimension: string
			value?: string | number | boolean
		}
		/**
		 * Y Dimension
		 */
		y: {
			dimension: string
			value?: string | number | boolean
		}
	}
}

export function getDatasetIndex (datasets: EChartOption.Dataset[], datasetNameOrIndex: string | number): number {
	return isNumber(datasetNameOrIndex) ? datasetNameOrIndex : datasets.findIndex(dataset => dataset.id === datasetNameOrIndex)
}

export function getDataset (datasets: EChartOption.Dataset[], datasetNameOrIndex: string | number): EChartOption.Dataset {
	return isNumber(datasetNameOrIndex) ? datasets[datasetNameOrIndex] : datasets.find(dataset => dataset.id === datasetNameOrIndex)
}

export function getDatasetDimensionIndex (dataset: EChartOption.Dataset, dimensionName: string): number {
	const index = (dataset.dimensions as any[]).findIndex((dimension): boolean => {
		return dimension === dimensionName || dimension.name === dimensionName
	})

	if (index === -1) {
		throw new Error(`Dataset "${dataset.id}" does not define dimension "${dimensionName}"`)
	}

	return index
}

export function getSourceValue (datasets: EChartOption.Dataset[], source: Source): any {
	const dataset = getDataset(datasets, source.dataset)
	const { x, y } = source.encode
	// TODO: Currently just supports row based values
	// Get row value
	const yDimensionIndex = getDatasetDimensionIndex(dataset, y.dimension)
	const row = (dataset.source as any[]).find((row) => row[yDimensionIndex] === y.value)
	// Get the column value from with in row
	const xIndex = getDatasetDimensionIndex(dataset, x.dimension)

	return row[xIndex]
}

type DatasetValue = string | number | boolean
type DatasetSource = [number, DatasetValue][]
interface DatasetIndexMap {
	[key: string]: number
}

export class ManagedDataset {
	private _dataset: EChartOption.Dataset[]

	public get dataset (): EChartOption.Dataset[] {
		return this._dataset
	}

	private _coreDataset: EChartOption.Dataset
	private _timeseriesDatasetMap: { [key: string]: EChartOption.Dataset, }

	protected getTimeseriesDataset (key: string): EChartOption.Dataset | undefined {
		return this._timeseriesDatasetMap[key]
	}

	protected createTimeseriesDataset (key: string): EChartOption.Dataset {
		if (this.getTimeseriesDataset(key)) {
			throw new Error(`Timeseries dataset for key "${key}" already exists`)
		}

		const dataset: EChartOption.Dataset = {
			id: key,
			dimensions: [
				{ name: 'timestamp', displayName: 'Time', type: 'time' },
				{ name: 'value', displayName: key },
			],
			source: [],
		}

		this._timeseriesDatasetMap[key] = dataset

		return dataset
	}

	// "{"lcpMode":false,"gensetUndervoltage":false,"oilPressure":99.5,"_id_":"rGFP7NMgp","waterTemperature":33.22,"lowOilPressure":false,"deviceId":"sputnik-GnIMPdIcI","currentEachPhase":29,"frequency":107,"gensetUnderfrequency":false,"voltageThreePhase":27,"gensetOverfrequency":false,"engineStatus":"run","power":60,"runningHours":315,"voltageSinglePhase":23,"timestamp":1590561312,"engineSpeed":94.93,"deviceIdTimestamp":"sputnik-GnIMPdIcI-1590561312","batteryVoltage":17,"expiresAt":1590993312,"overspeed":false,"highWaterTemperature":false,"maintenanceReminder":false,"namespace":"AAAA","gensetOvervoltage":false,"underspeed":false,"batteryUndevoltage":false,"batteryOvervoltage ":false}"
	public generateDataset (events: IoTEvent[]): void {
		// Reset dataset whne we get full set of events
		this._timeseriesDatasetMap = {}

		events.forEach(event => {
			if (event == null) {
				console.log('RealTimeDashboard:generateDataset: encountered undefined event')
			} else {
				const { timestamp } = event

				Object.entries(JSON.parse(event.data) as IoTEventData).forEach(([key, value]) => {
					let dataset = this.getTimeseriesDataset(key) || this.createTimeseriesDataset(key)

					;(dataset.source as DatasetSource).push([timestamp * 1000, value])
				})
			}
		})

		this._coreDataset = {
			id: 'core',
			dimensions: [
				{ name: 'property', type: 'ordinal' },
				{ name: 'lastUpdated', type: 'time' },
				{ name: 'lastValue', type: 'number' },
				{ name: 'average', type: 'float' },
			],
			source: [],
		}
		const timeseriesDatasets = Object.values(this._timeseriesDatasetMap).reduce((datasets, dataset) => {
			const source = dataset.source as DatasetSource

			const [lastUpdated, lastValue] = last(source)
			const average = isNumber(lastValue) ? source.reduce((sum, [timestamp, value]) => sum + (value as number), 0) / source.length : null

			;(this._coreDataset.source as any[]).push([
				dataset.id,
				lastUpdated * 1000,
				lastValue,
				average,
			])

			return datasets.concat(dataset)
		}, [])

		this._dataset = [
			this._coreDataset,
			...timeseriesDatasets,
		]
	}

	public updateDataset (event: IoTEvent): void {
		const { timestamp } = event

		Object.entries(JSON.parse(event.data) as IoTEventData).forEach(([key, value]) => {
			let dataset = this.getTimeseriesDataset(key)
			let isNewTimeseriesDataset = false

			if (dataset == null) {
				isNewTimeseriesDataset = true
				dataset = this.createTimeseriesDataset(key)
			}

			(dataset.source as DatasetSource).push([timestamp * 1000, value])

			if (isNewTimeseriesDataset) {
				(this._coreDataset.source as any[]).push([
					dataset.id,
					timestamp * 1000,
					value,
					value,
				])
			} else {
				const coreIndex = (this._coreDataset.source as any[]).findIndex(source => source[0] === key)
				const [,,, average] = (this._coreDataset.source as any[])[coreIndex]
				;(this._coreDataset.source as any[])[coreIndex] = [
					dataset.id,
					timestamp * 1000,
					value,
					average, // TODO: need to update average
				]
			}
		})
	}
}
