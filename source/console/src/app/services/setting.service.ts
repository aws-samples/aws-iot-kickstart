import { Injectable } from '@angular/core';

// Models
import { Setting } from '@models/setting.model';

// Services
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class SettingService {
    constructor(private appSyncService: AppSyncService) {}

    public getSetting(id: string) {
        return this.appSyncService.getSetting(id);
    }
    public updateSetting(setting: Setting) {
        return this.appSyncService.updateSetting(setting);
    }
    public getJustInTimeOnBoardingState() {
        return this.appSyncService.getJustInTimeOnBoardingState();
    }
    public setJustInTimeOnBoardingState(enabled: boolean) {
        return this.appSyncService.setJustInTimeOnBoardingState(enabled);
    }
}
