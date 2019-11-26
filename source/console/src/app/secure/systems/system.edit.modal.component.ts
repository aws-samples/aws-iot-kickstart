import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';

// Models
import { Device } from '@models/device.model';
import { System } from '@models/system.model';
import { SystemBlueprint } from '@models/system-blueprint.model';

// Services
import { DeviceService } from '@services/device.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { LoggerService } from '@services/logger.service';
import { SystemService } from '@services/system.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';

import { _ } from 'underscore';

class DeviceBlueprintPossibleDevices {
    device: Device;
    deviceBlueprintId: string;
    list: Device[];
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Component({
    selector: 'app-root-system-edit-modal',
    templateUrl: './system.edit.modal.component.html'
})
export class SystemEditModalComponent implements OnInit {
    @Input()
    element: System;
    @Input()
    modalType: string;
    @Input()
    deleteSubject: Subject<any>;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    public deviceBlueprintPossibleDevices: DeviceBlueprintPossibleDevices[] = [];
    public systemBlueprint: SystemBlueprint = new SystemBlueprint();

    constructor(
        private deviceService: DeviceService,
        private deviceBlueprintService: DeviceBlueprintService,
        private logger: LoggerService,
        private router: Router,
        private systemService: SystemService,
        private systemBlueprintService: SystemBlueprintService
    ) {
        this.element = new System({
            id: 'new',
            name: 'new'
        });
    }

    ngOnInit() {
        let _systemBlueprint;
        this.systemBlueprintService
            .get(this.element.systemBlueprintId)
            .then((systemBlueprint: SystemBlueprint) => {
                _systemBlueprint = systemBlueprint;
                return Promise.all(
                    systemBlueprint.spec.Devices.map((specDevice, index) => {
                        return Promise.all(
                            specDevice.deviceBlueprintId.map(deviceBlueprintId => {
                                return this.deviceService.listRecursive(
                                    'listDevicesWithDeviceBlueprint',
                                    deviceBlueprintId,
                                    10,
                                    null
                                );
                            })
                        ).then((results: any) => {
                            const devices: Device[] = results.flat();
                            if (this.element.deviceIds[index]) {
                                return this.deviceService
                                    .getDevice(this.element.deviceIds[index])
                                    .then((device: Device) => {
                                        return new DeviceBlueprintPossibleDevices({
                                            deviceBlueprintId: specDevice.deviceBlueprintId,
                                            device: device,
                                            list: devices
                                        });
                                    });
                            } else {
                                return new DeviceBlueprintPossibleDevices({
                                    deviceBlueprintId: specDevice.deviceBlueprintId,
                                    device: null,
                                    list: devices
                                });
                            }
                        });
                    })
                );
            })
            .then((results: DeviceBlueprintPossibleDevices[]) => {
                this.deviceBlueprintPossibleDevices = results;
                this.systemBlueprint = new SystemBlueprint(_systemBlueprint);
            })
            .catch(err => console.error(err));
    }

    submit() {
        this.systemService
            .update(
                this.element.id,
                this.element.name,
                this.element.description,
                this.element.deviceIds
            )
            .then((system: System) => {
                this.submitSubject.next({ data: system, error: null });
            })
            .catch(err => {
                // console.error(err);
                this.submitSubject.next({ data: this.element, error: err });
            });
    }

    cancel() {
        this.cancelSubject.next();
    }

    deviceBlueprintNameFor(deviceBlueprintId: string) {
        return _.find(this.deviceBlueprintService.deviceBlueprints, db => {
            return db.id === deviceBlueprintId;
        }).name;
    }

    refreshSpecs() {
        this.systemService
            .refreshSystem(this.element.id)
            .then(result => {
                console.log(result);
                swal.fire({
                    timer: 1000,
                    title: 'Success',
                    type: 'success',
                    showConfirmButton: false
                }).then(() => {
                    this.cancelSubject.next();
                });
            })
            .catch(err => {
                console.error(err);
                swal.fire('Oops...', 'Something went wrong!', 'error');
            });
    }

    delete() {
        swal.fire({
            title: 'Are you sure you want to delete this system?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.value) {
                this.systemService
                    .delete(this.element.id)
                    .then((resp: any) => {
                        this.deleteSubject.next({ data: resp, error: null });
                    })
                    .catch(err => {
                        this.deleteSubject.next({ data: this.element, error: err });
                    });
            }
        });
    }
}
