import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { DeviceType } from '@models/device-type.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeviceTypeService } from '@services/device-type.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-device-types',
    templateUrl: './device-types.component.html'
    // templateUrl: '../common/generic-table.component.html'
})
export class DeviceTypesComponent implements OnInit {

    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: DeviceType[];
    public tableHeaders = [
        { attr: 'type', name: 'type' },
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalDeviceTypes: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Device Types';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceTypeService: DeviceTypeService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalDeviceTypes = 0;
        this.tableData = deviceTypeService.deviceTypes;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'device-types' })
            ]);

            self.deviceTypeService.deviceTypesObservable$.subscribe(deviceTypes => {
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
        this.totalDeviceTypes = this.deviceTypeService.deviceTypes.length;
        this.pages.total = Math.ceil(this.totalDeviceTypes / this.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.deviceTypeService.refresh();
        this.pages.current = 1;
    }

    handleCreate() {
        this.router.navigate(['securehome/device-types/new']);
    }
}
