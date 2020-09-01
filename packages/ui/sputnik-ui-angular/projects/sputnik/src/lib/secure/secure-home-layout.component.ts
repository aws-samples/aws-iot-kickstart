import { Component, OnInit, NgZone } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
// Models
import { ProfileInfo } from '../models/profile-info.model'
import { DeviceStats, SystemStats } from '../models/stats.model'
// Services
import { BreadCrumbService, Crumb } from '../services/bread-crumb.service'
import { UserService } from '../services/user.service'
import { LoggerService } from '../services/logger.service'
import { StatService, Stats } from '../services/stat.service'
import { IoTService } from '../services/iot.service'
// import { AddonIoTService } from 'services/addon.iot/addon-iot.service';
// Services that cache
import { DeviceTypeService } from '../services/device-type.service'
import { DeviceBlueprintService } from '../services/device-blueprint.service'
import { SystemBlueprintService } from '../services/system-blueprint.service'
import { PageComponent } from './common/page.component'

// Helpers
declare let $: any

@Component({
	selector: 'app-root',
	templateUrl: './secure-home-layout.component.html',
})
export class SecureHomeLayoutComponent extends PageComponent {
	// }, LoggedInCallback {
	// private loadedProfile = false;

		public crumbs: Crumb[] = [];

		public deviceStats: DeviceStats = new DeviceStats();

		public systemStats: SystemStats = new SystemStats();

		public title: '';

		// TODO: enable this to show the Systems / System Blueprints
		public enableSystems = false

		@BlockUI()
		blockUI: NgBlockUI;

		constructor (
			userService: UserService,
				public router: Router,
				public route: ActivatedRoute,
				private logger: LoggerService,
				private breadCrumbService: BreadCrumbService,
				protected localStorage: LocalStorage,
				private statService: StatService,
				private ngZone: NgZone,
				private iotService: IoTService,
				// Here we load cached services for rest of app
				private deviceTypeService: DeviceTypeService,
				private deviceBlueprintService: DeviceBlueprintService,
				private systemBlueprintService: SystemBlueprintService,
		) {
			super(userService)

			this.localStorage.setItem('deviceStats', { total: 0, connected: 0, disconnected: 0 }).subscribe(() => {})
		}

		ngOnInit () {
			super.ngOnInit()

			this.breadCrumbService.pageTitleObservable$.subscribe(title => (this.title = title))
			this.breadCrumbService.crumbObservable$.subscribe(crumbs => {
				this.crumbs.splice(0, this.crumbs.length)
				this.crumbs.push(...crumbs)
				// this.ngZone.run(() => {})
			})

			this.iotService.connect()
			this.iotService.connectionObservable$.subscribe((connected: boolean) => {
				this.logger.info(`Change of connection state: new state: ${connected}`)
			})

			this.statService.statObservable$.subscribe((msg: Stats) => {
				this.deviceStats = msg.deviceStats
				this.systemStats = msg.systemStats
				this.ngZone.run(() => {})
			})
			this.statService.refresh()

			this.prepUI()
		}

		prepUI () {
		// ==============================================================
		// This is for the top header part and sidebar part
		// ==============================================================
			const set = function () {
				const width = window.innerWidth > 0 ? window.innerWidth : this.screen.width
				const topOffset = 70

				if (width < 1170) {
					$('body').addClass('mini-sidebar')
					$('.navbar-brand span').hide()
					$('.scroll-sidebar, .slimScrollDiv')
					.css('overflow-x', 'visible')
					.parent()
					.css('overflow', 'visible')
					$('.sidebartoggler i').addClass('ti-menu')
				} else {
					$('body').removeClass('mini-sidebar')
					$('.navbar-brand span').show()
				}

				let height = (window.innerHeight > 0 ? window.innerHeight : this.screen.height) - 1
				height = height - topOffset

				if (height < 1) {
					height = 1
				}

				if (height > topOffset) {
					$('.page-wrapper').css('min-height', height + 'px')
				}
			}
			$(window).ready(set)
			$(window).on('resize', set)

			// ==============================================================
			// Theme options
			// ==============================================================
			$('.sidebartoggler').on('click', function () {
				if ($('body').hasClass('mini-sidebar')) {
					$('body').trigger('resize')
					$('.scroll-sidebar, .slimScrollDiv')
					.css('overflow', 'hidden')
					.parent()
					.css('overflow', 'visible')
					$('body').removeClass('mini-sidebar')
					$('.navbar-brand span').show()
				} else {
					$('body').trigger('resize')
					$('.scroll-sidebar, .slimScrollDiv')
					.css('overflow-x', 'visible')
					.parent()
					.css('overflow', 'visible')
					$('body').addClass('mini-sidebar')
					$('.navbar-brand span').hide()
				}
			})

			// topbar stickey on scroll

			$('.fix-header .topbar').stick_in_parent({})

			// this is for close icon when navigation open in mobile view
			$('.nav-toggler').click(function () {
				$('body').toggleClass('show-sidebar')
				$('.nav-toggler i').toggleClass('ti-menu')
				$('.nav-toggler i').addClass('ti-close')
			})

			// ==============================================================
			// Auto select left navbar
			// ==============================================================
			$(function () {
				const url = window.location
				let element = $('ul#sidebarnav a')
				.filter(function () {
					return this.href === url.href
				})
				.addClass('active')
				.parent()
				.addClass('active')
				while (true) {
					if (element.is('li')) {
						element = element
						.parent()
						.addClass('in')
						.parent()
						.addClass('active')
					} else {
						break
					}
				}
			})

			// $(function() {
			//		$('#sidebarnav').metisMenu();
			// });
			this.blockUI.stop()
		}
}
