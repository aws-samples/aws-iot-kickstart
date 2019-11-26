import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { Setting } from '@models/setting.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { LoggerService } from '@services/logger.service';
import { SettingService } from '@services/setting.service';

@Component({
    selector: 'app-root-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    public title = 'System Settings';

    public profile: ProfileInfo = null;
    public isAdminUser = false;

    public appConfig: Setting = new Setting();
    public appConfigError = true;
    public appConfigErrorMessage = '';

    public justInTimeOnBoardingConfig: Setting = new Setting();
    public justInTimeOnBoardingConfigError = true;
    public justInTimeOnBoardingConfigErrorMessage = '';
    public justInTimeOnBoardingState = false;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private settingService: SettingService
    ) {}

    ngOnInit() {
        this.blockUI.start('Loading settings...');

        this.breadCrumbService.setup(this.title, [
            new Crumb({
                title: 'Settings',
                link: 'settings',
                active: true
            })
        ]);

        const _self = this;

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);
            _self.isAdminUser = _self.profile.isAdmin();
            _self.loadAllSettings();
        });
    }

    loadAllSettings() {
        const _self = this;
        _self.logger.info('Loading ALL settings:');

        if (_self.profile.isAdmin()) {
            _self
                .loadGeneralSettings()
                .then(data => {
                    _self.logger.info('Loaded general settings:', _self.appConfig);
                    return _self.loadJustInTimeOnBoardingSettings();
                })
                .then(data => {
                    _self.logger.info(
                        'Loaded Just In Time On Boarding Settings:',
                        _self.justInTimeOnBoardingState
                    );
                    _self.blockUI.stop();
                })
                .catch(err => {
                    _self.blockUI.stop();
                    _self.logger.error('error occurred calling loading the settings, show message', err);
                    return err;
                });
        }
    }

    loadGeneralSettings(): Promise<any> {
        const _self = this;
        return _self.settingService
            .getSetting('app-config')
            .then((data: Setting) => {
                _self.appConfig = data;
                if (_self.appConfig !== null) {
                    _self.appConfigError = false;
                } else {
                    _self.appConfigErrorMessage =
                        'General Application settings are not configured yet. Please use Factory reset.';
                }
                return data;
            })
            .catch(err => {
                _self.appConfigError = true;
                _self.appConfigErrorMessage = 'Unable to load the general application settings.';
                throw err;
            });
    }

    loadJustInTimeOnBoardingSettings(): Promise<any> {
        const _self = this;

        return _self.settingService
            .getJustInTimeOnBoardingState()
            .then(data => {
                _self.justInTimeOnBoardingState = data;
                _self.justInTimeOnBoardingConfigError = false;
                return data;
            })
            .catch(err => {
                _self.justInTimeOnBoardingConfigError = true;
                _self.justInTimeOnBoardingConfigErrorMessage =
                    'Unable to load the Just In Time On Boarding application settings.';
                throw err;
            });
    }

    public toggleJustInTimeOnBoarding() {
        const _self = this;
        _self.settingService
            .setJustInTimeOnBoardingState(!_self.justInTimeOnBoardingState)
            .then(result => {
                _self.justInTimeOnBoardingState = result;
            })
            .catch(err => {
                _self.logger.error('Toggle of Just In Time On Boarding Service failed:', err);
            });
    }

    update(setting: Setting) {
        console.log(setting);
        this.settingService.updateSetting(setting).then(result => {
            console.log(result);
        }).catch(err => {
            console.error(err);
        });
    }
}
