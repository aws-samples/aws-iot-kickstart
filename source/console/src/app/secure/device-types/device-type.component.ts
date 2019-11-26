import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    selector: 'app-root-device-type',
    templateUrl: './device-type.component.html'
})
export class DeviceTypeComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'Device Type';
    public deviceTypeId: string;
    public deviceType: DeviceType;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private deviceTypeService: DeviceTypeService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone
    ) {
        this.deviceTypeId = '';
        this.deviceType = undefined;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.route.params.subscribe(params => {
                self.deviceTypeId = params['id'];

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'device-types'
                    }),
                    new Crumb({
                        title: self.deviceTypeId,
                        active: true
                    })
                ]);

                self.loadDeviceType(self.deviceTypeId);

                self.blockUI.stop();
            });
        });
    }

    private loadDeviceType(deviceTypeId) {
        const self = this;
        self.deviceTypeService.deviceTypesObservable$.subscribe(message => {
            self.ngZone.run(() => {
                if (self.deviceTypeId !== 'new') {
                    self.deviceType = self.deviceTypeService.deviceTypes.find(deviceType => {
                        return deviceType.id === self.deviceTypeId;
                    });
                }
            });
        });

        if (self.deviceTypeId !== 'new') {
            self.deviceType = self.deviceTypeService.deviceTypes.find(deviceType => {
                return deviceType.id === self.deviceTypeId;
            });
        } else {
            self.deviceType = new DeviceType();
        }
    }

    cancel() {
        this.router.navigate(['/securehome/device-types']);
    }

    submit(f) {
        console.log(f);
        if (this.deviceTypeId === 'new') {
            this.deviceTypeService
                .add(this.deviceType)
                .then(deviceType => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Created deviceType:', deviceType);
                        this.router.navigate(['securehome/device-types/' + deviceType.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to create deviceType', 'error');
                    this.logger.error('Error creating deviceType:', err);
                });
        } else {
            this.deviceTypeService
                .update(this.deviceType)
                .then(deviceType => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Updated deviceType:', deviceType);
                        this.router.navigate(['securehome/device-types/' + deviceType.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to update deviceType', 'error');
                    this.logger.error('Error creating deviceType:', err);
                });
        }
    }

    delete() {
        swal.fire({
            title: 'Are you sure you want to delete this device type?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deleting device type...');
                this.deviceTypeService
                    .delete(this.deviceType.id)
                    .then((resp: any) => {
                        this.blockUI.stop();
                        this.router.navigate(['securehome/device-types']);
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal.fire('Oops...', 'Something went wrong! Unable to delete the device type.', 'error');
                        this.logger.error('error occurred calling deleteDeviceType api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }
}
