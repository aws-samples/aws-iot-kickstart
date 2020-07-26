import { isEmpty } from 'underscore'
import { Component, OnInit, NgModule, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxMapboxGLModule } from 'ngx-mapbox-gl'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { ProfileInfo } from '@models/profile-info.model'
import { Setting } from '@models/setting.model'
import { LoggerService } from '@services/logger.service'
import { SettingService } from '@services/setting.service'
import { ChartConfig } from './ChartConfig'
import { RealTimeDataService } from '../../../services/realtime-data.service'

@Component({
	selector: 'geo',
	template: `
	<mgl-map
	*ngIf="accessToken && longitude && latitude"
	[accessToken]="accessToken"
	[style]="'mapbox://styles/mapbox/bright-v9'"
	[zoom]="[10]"
	[center]="[longitude,latitude]"
	>
	<mgl-geojson-source id="symbols-source">
	<mgl-marker [lngLat]="[longitude,latitude]"></mgl-marker>
	</mgl-geojson-source>
	</mgl-map>
	<div *ngIf="invalidAccessToken">Mapbox Access Token is invalid</div>
	`,
	styles: [`
	mgl-map {
		height: 100%;
		width: 100%;
	}
	`],
})
export class MapboxComponent implements OnInit {
	public title = 'Maps';

	private profile: ProfileInfo;

	accessToken: string

	invalidAccessToken: boolean

	@Input() config: ChartConfig

	@Input() latitude: number

	@Input() longitude: number

	constructor (
		private localStorage: LocalStorage,
		private logger: LoggerService,
		private settingService: SettingService,
		private realtimeDataService: RealTimeDataService,
	) {}

	ngOnInit () {
		this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
			this.profile = new ProfileInfo(profile)
			this.settingService
			.getSetting('app-config')
			.then((setting: Setting) => {
				const accessToken = setting.setting.mapboxToken

				if (isEmpty(accessToken) || accessToken === 'NA') {
					this.invalidAccessToken = true
				} else {
					this.invalidAccessToken = false
					this.accessToken = this.profile.mapboxToken = accessToken
				}
			})
		})

		this.realtimeDataService.datasetObservable.subscribe(dataset => {
			if (this.realtimeDataService.ready) {
				const coordinates = this.realtimeDataService.getSourceValue({
					dataset: 'core',
					encode: {
						y: { dimension: 'property', value: 'geo' },
						x: { dimension: 'lastValue' },
					},
				}) as Coordinates

				if (coordinates) {
					this.longitude = coordinates.longitude
					this.latitude = coordinates.latitude
				}
			}
		})
	}
}

	@NgModule({
		declarations: [
			MapboxComponent,
		],
		exports: [
			MapboxComponent,
		],
		imports: [
			CommonModule,
			NgxMapboxGLModule,
		],
		providers: [],
	})
export class MapboxModule {}
