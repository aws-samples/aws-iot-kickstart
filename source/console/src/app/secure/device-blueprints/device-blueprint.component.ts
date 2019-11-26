import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { DeviceBlueprint } from '@models/device-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { DeviceTypeService } from '@services/device-type.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-device-blueprint',
    templateUrl: './device-blueprint.component.html'
})
export class DeviceBlueprintComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'Device Blueprint';
    public deviceBlueprintId: string;
    public deviceBlueprint: DeviceBlueprint;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private deviceBlueprintService: DeviceBlueprintService,
        public deviceTypeService: DeviceTypeService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone
    ) {
        this.deviceBlueprintId = '';
        this.deviceBlueprint = undefined;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.route.params.subscribe(params => {
                self.deviceBlueprintId = params['id'];

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'device-blueprints'
                    }),
                    new Crumb({
                        title: self.deviceBlueprintId,
                        active: true
                    })
                ]);

                self.loadDeviceBlueprint(self.deviceBlueprintId);

                self.blockUI.stop();
            });
        });
    }

    private loadDeviceBlueprint(deviceBlueprintId) {
        const self = this;
        self.deviceBlueprintService.deviceBlueprintsObservable$.subscribe(message => {
            self.ngZone.run(() => {
                if (self.deviceBlueprintId !== 'new') {
                    self.deviceBlueprint = self.deviceBlueprintService.deviceBlueprints.find(deviceBlueprint => {
                        return deviceBlueprint.id === self.deviceBlueprintId;
                    });
                }
            });
        });

        if (self.deviceBlueprintId !== 'new') {
            self.deviceBlueprint = self.deviceBlueprintService.deviceBlueprints.find(deviceBlueprint => {
                return deviceBlueprint.id === self.deviceBlueprintId;
            });
        } else {
            self.deviceBlueprint = new DeviceBlueprint();
        }
    }

    cancel() {
        this.router.navigate(['/securehome/device-blueprints']);
    }

    submit(f) {
        console.log(f);
        if (this.deviceBlueprintId === 'new') {
            this.deviceBlueprintService
                .add(this.deviceBlueprint)
                .then(deviceBlueprint => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Created deviceBlueprint:', deviceBlueprint);
                        this.router.navigate(['securehome/device-blueprints/' + deviceBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to create deviceBlueprint', 'error');
                    this.logger.error('Error creating deviceBlueprint:', err);
                });
        } else {
            this.deviceBlueprintService
                .update(this.deviceBlueprint)
                .then(deviceBlueprint => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Updated deviceBlueprint:', deviceBlueprint);
                        this.router.navigate(['securehome/device-blueprints/' + deviceBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to update deviceBlueprint', 'error');
                    this.logger.error('Error creating deviceBlueprint:', err);
                });
        }
    }

    delete() {
        swal.fire({
            title: 'Are you sure you want to delete this device blueprint?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deleting device blueprint...');
                this.deviceBlueprintService
                    .delete(this.deviceBlueprint.id)
                    .then((resp: any) => {
                        this.blockUI.stop();
                        this.router.navigate(['securehome/device-blueprints']);
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal.fire('Oops...', 'Something went wrong! Unable to delete the device blueprint.', 'error');
                        this.logger.error('error occurred calling deleteDeviceBlueprint api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }

    inCompatibilityList(id: string) {
        if (this.deviceBlueprint.compatibility) {
            return (
                this.deviceBlueprint.compatibility.findIndex(devicetypetype => {
                    return devicetypetype === id;
                }) !== -1
            );
        } else {
            return false;
        }
    }

    toggleDeviceType(event, id: string) {
        const index = this.deviceBlueprint.compatibility.indexOf(id);
        if (index === -1) {
            this.deviceBlueprint.compatibility.push(id);
        } else {
            this.deviceBlueprint.compatibility.splice(index, 1);
        }
        // self.logger.info(self.deviceBlueprint.compatibility);
        event.stopPropagation();
        event.preventDefault();
    }
}
