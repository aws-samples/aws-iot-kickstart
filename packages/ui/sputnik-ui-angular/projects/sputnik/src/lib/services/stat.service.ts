import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { getEnvironment } from '../environment'
// Models
import { DeviceStats, SystemStats } from '../models/stats.model'
// Services
import { LoggerService } from './logger.service'
import { AppSyncService } from './appsync.service'

const environment = getEnvironment()

// Helpers

export class Stats {
		deviceStats: DeviceStats;

		systemStats: SystemStats;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}

@Injectable()
export class StatService {
		private pollerInterval: any = null;

		private observer: any = new Subject<Stats>();

		statObservable$ = this.observer.asObservable();

		constructor (
				private logger: LoggerService,
				private appSyncService: AppSyncService,
		) {
			const _self = this
			_self.logger.info('StatService.constructor:')
			_self.pollerInterval = setInterval(function () {
				_self.refresh()
			}, environment.refreshInterval)
			_self.refresh()
		}

		loadStats () {
			const _self = this
			Promise.all([_self.appSyncService.getDeviceStats(), _self.appSyncService.getSystemStats()])
			.then(results => {
				_self.observer.next(new Stats({ deviceStats: results[0], systemStats: results[1] }))
			})
			.catch(err => {
				_self.logger.warn('error occurred calling getDeviceStats api, show message')
				_self.logger.warn(err)
			})
		}

		refresh () {
			this.loadStats()
		}
}
