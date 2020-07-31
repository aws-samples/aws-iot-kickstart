import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { IoTEvent } from '../../models/iot-event.model'
import { LoggerService } from '../logger.service'
import { AppSyncService, AddedIoTEvent } from '../appsync.service'
import { EChartOption } from 'echarts'
import { ManagedDataset, getDatasetIndex, Source, getSourceValue } from './dataset'

@Injectable()
export class RealTimeDataService implements AddedIoTEvent {
	private managedDataset = new ManagedDataset()

	private datasetSubject = new Subject<EChartOption.Dataset[]>()

	public datasetObservable = this.datasetSubject.asObservable()

	constructor (private logger: LoggerService, private appSyncService: AppSyncService) {
		this.appSyncService.onAddedIoTEvent(this)
	}

	public async getEvents (namespace: string, deviceId: string): Promise<IoTEvent[]> {
		const events = await this.appSyncService.getIoTEvents(namespace, deviceId)
		this.managedDataset.generateDataset(events)
		this.datasetSubject.next(this.managedDataset.dataset)

		return events
	}

	public async getLastEvent (namespace: string, deviceId: string): Promise<IoTEvent> {
		return this.appSyncService.getLastIoTEvent(namespace, deviceId)
	}

	onAddedIoTEvent (event: IoTEvent): void {
		this.managedDataset.updateDataset(event)
		this.datasetSubject.next(this.managedDataset.dataset)
	}

	public getDatasetIndex (dataset: string | number): number {
		return getDatasetIndex(this.managedDataset.dataset, dataset)
	}

	public getSourceValue (source: Source): any {
		if (this.ready) {
			return getSourceValue(this.managedDataset.dataset, source)
		}
	}

	public get ready (): boolean {
		return this.managedDataset.dataset && this.managedDataset.dataset.length > 0
	}
}
