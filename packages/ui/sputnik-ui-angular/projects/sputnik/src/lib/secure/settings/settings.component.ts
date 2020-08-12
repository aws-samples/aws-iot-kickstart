import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Setting } from '../../models/setting.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { LoggerService } from '../../services/logger.service'
import { SettingService } from '../../services/setting.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-settings',
	templateUrl: './settings.component.html',
})
export class SettingsComponent extends PageComponent {
		public title = 'System Settings';

		public appConfig: Setting = new Setting();

		public appConfigError = true;

		public appConfigErrorMessage = '';

		public justInTimeOnBoardingConfig: Setting = new Setting();

		public justInTimeOnBoardingConfigError = true;

		public justInTimeOnBoardingConfigErrorMessage = '';

		public justInTimeOnBoardingState = false;

		constructor (
			userService: UserService,
			public router: Router,
			private breadCrumbService: BreadCrumbService,
			private logger: LoggerService,
			private settingService: SettingService,
		) {
			super(userService)
		}

		ngOnInit () {
			super.ngOnInit()

			this.blockUI.start('Loading settings...')

			this.breadCrumbService.setup(this.title, [
				new Crumb({
					title: 'Settings',
					link: '/settings',
					active: true,
				}),
			])

			this.loadAllSettings()
		}

		loadAllSettings () {
			this.logger.info('Loading ALL settings:')

			if (this.isAdminUser) {
				this.loadGeneralSettings()
				.then(data => {
					this.logger.info('Loaded general settings:', this.appConfig)

					return this.loadJustInTimeOnBoardingSettings()
				})
				.then(data => {
					this.logger.info(
						'Loaded Just In Time On Boarding Settings:',
						this.justInTimeOnBoardingState,
					)
					this.blockUI.stop()
				})
				.catch(err => {
					this.blockUI.stop()
					this.logger.error('error occurred calling loading the settings, show message', err)

					return err
				})
			}
		}

		loadGeneralSettings (): Promise<any> {
			return this.settingService
			.getSetting('app-config')
			.then((data: Setting) => {
				this.appConfig = data

				if (this.appConfig !== null) {
					this.appConfigError = false
				} else {
					this.appConfigErrorMessage =
												'General Application settings are not configured yet. Please use Factory reset.'
				}

				return data
			})
			.catch(err => {
				this.appConfigError = true
				this.appConfigErrorMessage = 'Unable to load the general application settings.'
				throw err
			})
		}

		loadJustInTimeOnBoardingSettings (): Promise<any> {
			return this.settingService
			.getJustInTimeOnBoardingState()
			.then(data => {
				this.justInTimeOnBoardingState = data
				this.justInTimeOnBoardingConfigError = false

				return data
			})
			.catch(err => {
				this.justInTimeOnBoardingConfigError = true
				this.justInTimeOnBoardingConfigErrorMessage =
										'Unable to load the Just In Time On Boarding application settings.'
				throw err
			})
		}

		public toggleJustInTimeOnBoarding () {
			this.settingService
			.setJustInTimeOnBoardingState(!this.justInTimeOnBoardingState)
			.then(result => {
				this.justInTimeOnBoardingState = result
			})
			.catch(err => {
				this.logger.error('Toggle of Just In Time On Boarding Service failed:', err)
			})
		}

		update (setting: Setting) {
			console.log(setting)
			this.settingService.updateSetting(setting).then(result => {
				console.log(result)
			}).catch(err => {
				console.error(err)
			})
		}
}
