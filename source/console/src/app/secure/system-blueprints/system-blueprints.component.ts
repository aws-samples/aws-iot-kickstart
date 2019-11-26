import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { SystemBlueprint } from '@models/system-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-system-blueprints',
    templateUrl: './system-blueprints.component.html'
    // templateUrl: '../common/generic-table.component.html'
})
export class SystemBlueprintsComponent implements OnInit {

    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: SystemBlueprint[];
    public tableHeaders = [
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalSystemBlueprints: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'System Blueprints';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private systemBlueprintService: SystemBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalSystemBlueprints = 0;
        this.tableData = systemBlueprintService.systemBlueprints;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'system-blueprints' })
            ]);

            self.systemBlueprintService.systemBlueprintsObservable$.subscribe(systemBlueprints => {
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
        this.totalSystemBlueprints = this.systemBlueprintService.systemBlueprints.length;
        this.pages.total = Math.ceil(this.totalSystemBlueprints / this.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.systemBlueprintService.refresh();
        this.pages.current = 1;
    }

    handleCreate() {
        this.router.navigate(['securehome/system-blueprints/new']);
    }
}
