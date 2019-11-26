import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm, Validator } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { Device } from '@models/device.model';
import { DeviceType } from '@models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeviceService } from '@services/device.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { DeviceTypeService } from '@services/device-type.service';
import { LoggerService } from '@services/logger.service';
import { StatService } from '@services/stat.service';

// Helpers
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-root-devices',
    templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
    public title = 'Devices';
    public deviceStats: any = {};
    private profile: ProfileInfo = null;
    public devices: Device[] = [];
    public newDevice: Device;
    // public deviceTypes: DeviceType[] = [];
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private deviceService: DeviceService,
        public deviceBlueprintService: DeviceBlueprintService,
        public deviceTypeService: DeviceTypeService,
        private statService: StatService,
        private ngZone: NgZone
    ) {}

    ngOnInit() {
        const _self = this;
        _self.newDevice = new Device();
        _self.blockUI.start('Loading devices...');

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);

            _self.breadCrumbService.setup(_self.title, [
                new Crumb({ title: _self.title, active: true, link: 'devices' })
            ]);

            _self.loadDevices();

            _self.statService.statObservable$.subscribe(message => {
                _self.deviceStats = message.deviceStats;
                _self.ngZone.run(() => {
                    _self.updatePaging();
                });
            });

            _self.deviceService.devicesObservable$.subscribe(device => {
                _self.ngZone.run(() => {
                    _self.loadDevices();
                });
            });
        });

        // _self.deviceTypeService.deviceTypesObservable$.subscribe(message => {
        //     _self.deviceTypes = message;
        //     _self.ngZone.run(() => {});
        // });
    }

    updatePaging() {
        const _self = this;
        // console.log(_self.pages.pageSize, _self.deviceStats.total);
        _self.pages.total = Math.ceil(_self.deviceStats.total / _self.pages.pageSize);
    }

    loadDevices() {
        const _self = this;

        _self.statService.refresh();

        return _self.deviceService
            .listDevices(_self.pages.pageSize, null)
            .then(results => {
                // console.log(results);
                _self.devices = results.devices;
                _self.updatePaging();
                _self.blockUI.stop();
            })
            .catch(err => {
                swal.fire('Oops...', 'Something went wrong! Unable to retrieve the devices.', 'error');
                _self.logger.error('error occurred calling listDevices api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/devices']);
            });
    }

    refreshData() {
        this.blockUI.start('Loading devices...');
        this.loadDevices();
    }

    openDevice(thingId: string) {
        this.router.navigate([['/securehome/devices', thingId].join('/')]);
    }

    formatDate(dt: string) {
        if (dt) {
            return moment(dt).format('MMM Do YYYY');
        } else {
            return '';
        }
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start('Loading device types...');
        this.loadDevices();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start('Loading device types...');
        this.loadDevices();
    }

    showCreateForm() {
        this.newDevice = new Device();
        $('#createModal').modal('show');
    }
    cancelCreateForm(form: NgForm) {
        form.reset();
        $('#createModal').modal('hide');
    }
    submitCreateDevice(value: any) {
        const _self = this;

        _self.blockUI.start('Creating device...');

        _self.deviceService
            .addDevice(_self.newDevice.name)
            .then((device: Device) => {
                _self.loadDevices();
                $('#createModal').modal('hide');
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', 'Something went wrong! Unable to update the device.', 'error');
                _self.logger.error('error occurred calling updateDevice api, show message');
                _self.logger.error(err);
                _self.loadDevices();
            });
    }
}

