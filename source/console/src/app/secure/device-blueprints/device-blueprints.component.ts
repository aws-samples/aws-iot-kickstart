import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { DeviceBlueprint } from '@models/device-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-device-blueprints',
    templateUrl: './device-blueprints.component.html'
})
export class DeviceBlueprintsComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: DeviceBlueprint[];
    public tableHeaders = [
        { attr: 'type', name: 'type' },
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalDeviceBlueprints: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Device Blueprints';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceBlueprintService: DeviceBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalDeviceBlueprints = 0;
        this.tableData = deviceBlueprintService.deviceBlueprints;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'device-blueprints' })
            ]);

            self.deviceBlueprintService.deviceBlueprintsObservable$.subscribe(deviceBlueprints => {
                self.ngZone.run(() => {
                    self.load();
                });
            });

            self.load();
        });
    }

    private load() {
        this.blockUI.stop();
        this.updatePaging();
    }

    private updatePaging() {
        this.totalDeviceBlueprints = this.deviceBlueprintService.deviceBlueprints.length;
        this.pages.total = Math.ceil(this.totalDeviceBlueprints / this.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.deviceBlueprintService.refresh();
        this.pages.current = 1;
    }

    handleCreate() {
        this.router.navigate(['securehome/device-blueprints/new']);
    }
}
