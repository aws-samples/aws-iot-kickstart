import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { Device } from '@models/device.model';
import { DeviceType } from '@models/device-type.model';
import { DeviceBlueprint } from '@models/device-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeploymentService } from '@services/deployment.service';
import { DeviceService } from '@services/device.service';
import { DeviceTypeService } from '@services/device-type.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { LoggerService } from '@services/logger.service';

declare var jquery: any;
declare var $: any;
import { _ } from 'underscore';

@Component({
    selector: 'app-root-device',
    templateUrl: './device.component.html'
})
export class DeviceComponent implements OnInit, OnDestroy {
    public title = 'Device';
    public thingId: string;
    private profile: ProfileInfo = null;

    public isAdminUser: boolean;
    public device: Device = new Device();

    public deviceForEdit: Device = new Device();
    public deviceBlueprintsForEdit: DeviceBlueprint[] = [];

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        protected localStorage: LocalStorage,
        private _ngZone: NgZone,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private deploymentService: DeploymentService,
        private deviceService: DeviceService,
        public deviceBlueprintService: DeviceBlueprintService,
        public deviceTypeService: DeviceTypeService
    ) {}

    ngOnInit() {
        const _self = this;

        _self.route.params.subscribe(params => {
            _self.thingId = params['thingId'];
        });

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({
                title: 'Devices',
                link: 'devices'
            }),
            new Crumb({
                title: _self.thingId,
                active: true
            })
        ]);

        _self.blockUI.start('Loading device...');

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);
            _self.isAdminUser = _self.profile.isAdmin();
            _self.loadDevice();
            // this.pollerInterval = setInterval(function() {
            //     _self.loadDevice();
            // }, environment.refreshInterval);
        });
    }

    ngOnDestroy() {
        // this.logger.info('destroying device page, attempting to remove poller.');
        // clearInterval(this.pollerInterval);
    }

    private loadDevice() {
        const _self = this;

        _self.deviceService
            .getDevice(_self.thingId)
            .then((device: Device) => {
                _self.device = device;
                _self.blockUI.stop();
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', 'Something went wrong! Unable to retrieve the device.', 'error');
                _self.logger.error('error occurred calling getDevice api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/devices']);
            });
    }

    public refreshData() {
        this.blockUI.start('Loading device...');
        this.loadDevice();
    }

    submitEditDevice(value: any) {
        const _self = this;
        _self.blockUI.start('Editing device...');
        // console.log(JSON.stringify(_self.deviceForEdit, null, 4));
        _self.deviceService
            .updateDevice(_self.deviceForEdit)
            .then((resp: any) => {
                $('#editModal').modal('hide');
                console.log('Updated device:', resp);
                _self.device = new Device(resp);
                // _self.getTheExtraResources();
                _self.blockUI.stop();
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', 'Something went wrong! Unable to update the device.', 'error');
                _self.logger.error('error occurred calling updateDevice api, show message');
                _self.logger.error(err);
                _self.loadDevice();
            });
    }

    deleteDevice(device: Device) {
        const _self = this;
        swal.fire({
            title: 'Are you sure you want to delete this device?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            $('#editModal').modal('hide');
            if (result.value) {
                _self.blockUI.start('Deleting device...');
                _self.deviceService
                    .deleteDevice(device.thingId)
                    .then((resp: any) => {
                        // console.log(resp);
                        _self.router.navigate(['/securehome/devices']);
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal.fire('Oops...', 'Something went wrong! Unable to delete the widget.', 'error');
                        _self.logger.error('error occurred calling deleteDevice api, show message');
                        _self.logger.error(err);
                        _self.loadDevice();
                    });
            }
        });
    }

    public showEditForm() {
        this.deviceForEdit = new Device(this.device);
        this.deviceBlueprintsForEdit = this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId);

        $('#editModal').modal('show');
    }

    public deploy() {
        console.log('Deploy', this.device.thingId);
        swal.fire({
            title: 'Are you sure you want to deploy this device?',
            text: `This will overwrite whatever the device is doing!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, deploy it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deploying device...');
                return this.deploymentService
                    .addDeployment(this.device.thingId)
                    .then(deployment => {
                        console.log(deployment);
                        this.blockUI.stop();
                        swal.fire({
                            timer: 1000,
                            title: 'Success',
                            type: 'success',
                            showConfirmButton: false
                        }).then();
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal.fire(
                            'Oops...',
                            'Unable to deploy the device. There could be an error in your blueprints.',
                            'error'
                        );
                        this.logger.error('error occurred calling addDeployment api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }

    filterDeviceBlueprintsForDeviceTypeId(deviceTypeId) {
        if (deviceTypeId === 'UNKNOWN') {
            return this.deviceBlueprintService.deviceBlueprints;
        } else {
            return _.filter(this.deviceBlueprintService.deviceBlueprints, (deviceBlueprint: DeviceBlueprint) => {
                return (
                    _.contains(deviceBlueprint.compatibility, deviceTypeId) ||
                    _.contains(deviceBlueprint.compatibility, 'all')
                );
            });
        }
    }

    public deviceTypeChanged() {
        console.log('Changed device Type!', this.deviceForEdit.deviceTypeId);
        this.deviceBlueprintsForEdit = this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId);
    }

    public createCertificate() {
        this.blockUI.start('Generating certificate for device...');

        this.deviceService
            .createCertificate(this.device)
            .then((cert: any) => {
                this.logger.info(cert);
                this.blockUI.stop();
                this.deviceService.createZip([cert]);
            })
            .catch(err => {
                this.blockUI.stop();
                swal.fire('Oops...', 'Something went wrong! Unable to create the certificate.', 'error');
                this.logger.error('error occurred calling createCertificate api, show message');
                this.logger.error(err);
            });
    }
}
