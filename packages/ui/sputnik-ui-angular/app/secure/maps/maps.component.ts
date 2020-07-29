import { Component, OnInit, NgZone, NgModule, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import { LocalStorage } from '@ngx-pwa/local-storage'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
import { Setting } from '../../models/setting.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { LoggerService } from '../../services/logger.service'
import { SettingService } from '../../services/setting.service'

declare let mapboxgl: any
declare let $: any

@Component({
	selector: 'app-maps',
	templateUrl: './maps.component.html',
})
export class MapsComponent implements OnInit {
		public title = 'Maps';

		private map: any;

		private profile: ProfileInfo;

		public invalidMapboxToken = false;

		public gps: any = {
			latitude: 1.283699, // 38.955796,
			longitude: 103.849393, // - 77.395869
		};

		@BlockUI()
		blockUI: NgBlockUI;

		constructor (
				public router: Router,
				private breadCrumbService: BreadCrumbService,
				private localStorage: LocalStorage,
				private logger: LoggerService,
				private settingService: SettingService,
		) {}

		ngOnInit () {
			const _self = this
			_self.breadCrumbService.setup(_self.title, [])
			_self.blockUI.stop()

			_self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
				_self.profile = new ProfileInfo(profile)
				_self.settingService
				.getSetting('app-config')
				.then((setting: Setting) => {
					_self.profile.mapboxToken = setting.setting.mapboxToken
					_self.invalidMapboxToken = false

					$('#map').css('height', '300px')

					// const set = function () {
					//	console.log('window:', $(window).height())
					//	console.log('header:', $('header').height())
					//	$('#map').css('height', $(window).height() - $('header').height() + 'px')
					//	// $('#map').css('height', $('.page-wrapper')[0].offsetHeight + 'px');
					//	console.log($(window).height() - $('header').height() + 'px')
					// }
					// $(window).ready(set)
					// $(window).on('resize', set)
					// set()

					_self.createMap()
				})
				.catch(err => console.error)
			})
		}

		createMap () {
			const _self = this

			if (_self.profile.mapboxToken === 'NA' || _self.profile.mapboxToken === '') {
				_self.invalidMapboxToken = true

				return
			}

			mapboxgl.accessToken = _self.profile.mapboxToken
			_self.map = new mapboxgl.Map({
				container: 'map', // container id
				style: 'mapbox://styles/mapbox/bright-v9', // stylesheet location
				center: [_self.gps.longitude, _self.gps.latitude], // starting position [lng, lat]
				zoom: 14, // starting zoom
			})

			_self.map.on('error', function (err: any) {
				_self.logger.error('mapbox gl error')
				_self.logger.error(err)
				_self.invalidMapboxToken = true
			})

			_self.map.on('load', function () {
				_self.map.addSource('sourceTest', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [
							{
								type: 'Feature',
								properties: {},
								geometry: {
									type: 'Point',
									coordinates: [_self.gps.longitude, _self.gps.latitude],
								},
							},
						],
					},
				})

				_self.map.addLayer({
					id: 'layerTest',
					source: 'sourceTest',
					type: 'circle',
					paint: {
						'circle-radius': 10,
						'circle-color': '#1de9b6',
						'circle-opacity': 0.7,
						'circle-stroke-width': 2,
						'circle-stroke-color': '#00897b',
					},
				})
			})
		}

	// updateMap() {
	//		this.map.setCenter([this.telematics.longitude, this.telematics.latitude]);
	//		this.map.getSource('sourceTest').setData({
	//				type: 'FeatureCollection',
	//				features: [
	//						{
	//								type: 'Feature',
	//								properties: {},
	//								geometry: {
	//										type: 'Point',
	//										coordinates: [this.telematics.longitude, this.telematics.latitude]
	//								}
	//						}
	//				]
	//		});
	// }
}

@NgModule({
	declarations: [
		MapsComponent,
	],
	exports: [
		MapsComponent,
	],
	imports: [
		CommonModule,
	],
	providers: [],
})
export class MapsModule {}
