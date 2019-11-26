import { Component, OnInit, NgZone, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// SubComponents
import { SystemsModalComponent } from './systems.modal.component';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { System } from '@models/system.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { SystemService } from '@services/system.service';
import { StatService, Stats } from '@services/stat.service';
import { LoggerService } from '@services/logger.service';

declare var $: any;

@Component({
    selector: 'app-root-systems',
    templateUrl: './systems.component.html'
})
export class SystemsComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: System[];
    public tableHeaders = [
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalSystems: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Systems';

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('createModalTemplate', { read: ViewContainerRef })
    createModalTemplate: ViewContainerRef;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private systemService: SystemService,
        private statService: StatService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalSystems = 0;
        this.tableData = [];
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'systems' })
            ]);

            self.statService.statObservable$.subscribe((message: Stats) => {
                this.ngZone.run(() => {
                    this.totalSystems = message.systemStats.total;
                });
            });

            self.statService.refresh();

            self.load();
        });
    }

    private getSystems(ofPage: number, nextToken: string) {
        return this.systemService.list(this.pages.pageSize, nextToken).then(data1 => {
            if (ofPage === 0) {
                return data1;
            } else if (data1.nextToken) {
                return this.getSystems(ofPage - 1, data1.nextToken).then(data2 => {
                    return data2;
                });
            } else {
                throw new Error('Something is wrong');
            }
        });
    }

    private load() {
        const self = this;

        return self
            .getSystems(self.pages.current - 1, null)
            .then(results => {
                self.tableData = results.systems;
                self.updatePaging();
                self.blockUI.stop();
            })
            .catch(err => {
                swal.fire('Oops...', 'Something went wrong! Unable to retrieve the systems.', 'error');
                self.logger.error('error occurred calling listSystems api');
                self.logger.error(err);
                self.router.navigate(['/securehome/systems']);
            });
    }

    private updatePaging() {
        this.pages.total = Math.ceil(this.totalSystems / this.pages.pageSize);
    }

    public refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.pages.current = 1;
        this.load();
    }

    public handleCreate() {
        const self = this;
        self.createModalTemplate.clear();

        const componentRef = this.createModalTemplate.createComponent(this.resolver.resolveComponentFactory(SystemsModalComponent));
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            self.handleCancelCreate();
        });

        const submitSubject: Subject<any> = new Subject<any>();
        submitSubject.subscribe(result => {
            self.handleCancelCreate();
            if (result.error) {
                swal.fire('Oops...', 'Something went wrong!', 'error');
                self.logger.error('error occurred calling api, show message');
                self.logger.error(result.error);
            } else {
                swal.fire({ timer: 1000, title: 'Success', type: 'success', showConfirmButton: false }).then();
            }
            self.refreshData();
        });

        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        $('#createModalTemplate').modal('show');
    }

    private handleCancelCreate() {
        $('#createModalTemplate').modal('hide');
        this.createModalTemplate.clear();
    }

}
