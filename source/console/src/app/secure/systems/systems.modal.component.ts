import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { Device } from '@models/device.model';
import { System } from '@models/system.model';
import { SystemBlueprint } from '@models/system-blueprint.model';

// Services
import { LoggerService } from '@services/logger.service';
import { DeviceService } from '@services/device.service';
import { SystemService } from '@services/system.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';

@Component({
    selector: 'app-root-systems-modal',
    templateUrl: './systems.modal.component.html'
})
export class SystemsModalComponent {
    @Input()
    element: System;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    @BlockUI()
    blockUI: NgBlockUI;

    public createResources;

    constructor(
        private logger: LoggerService,
        private deviceService: DeviceService,
        private systemService: SystemService,
        public systemBlueprintService: SystemBlueprintService
    ) {
        this.modalType = 'create';
        this.element = new System({
            id: 'new',
            name: 'new',
            description: 'New System'
        });
        this.createResources = true;
    }

    submit() {
        if (this.modalType === 'create' && this.element.systemBlueprintId !== undefined) {
            this.blockUI.start(`Creating devices...`);
            console.log('element', this.element);
            this.systemBlueprintService
                .get(this.element.systemBlueprintId)
                .then((systemBlueprint: SystemBlueprint) => {
                    if (
                        this.createResources &&
                        systemBlueprint.hasOwnProperty('spec') &&
                        systemBlueprint.spec.hasOwnProperty('Devices')
                    ) {
                        return Promise.all(
                            systemBlueprint.spec.Devices.map(device => {
                                return this.deviceService
                                    .addDevice((systemBlueprint.prefix || 'SYSTEM_') + device.ref)
                                    .then((dev: Device) => {
                                        dev.deviceTypeId = device.defaultDeviceTypeId;
                                        dev.deviceBlueprintId = device.deviceBlueprintId[0];
                                        return this.deviceService.updateDevice(dev).then(d => dev.thingId);
                                    });
                            })
                        );
                    } else {
                        return [];
                    }
                })
                .then(deviceIds => {
                    this.blockUI.start(`Creating system...`);
                    return this.systemService
                        .add(this.element.name, this.element.description, deviceIds, this.element.systemBlueprintId)
                        .then(system => {
                            this.blockUI.stop();
                            this.submitSubject.next({ data: system, error: null });
                        });
                })
                .catch(error => {
                    console.error('There was an error generating system', error);
                    this.blockUI.stop();
                    this.submitSubject.next({ data: this.element, error: error });
                });
        } else if (this.modalType === 'edit') {
            this.blockUI.start(`Editing system...`);
            this.systemService
                .update(this.element.id, this.element.name, this.element.description, this.element.deviceIds)
                .then(system => {
                    console.log(system);
                    this.blockUI.stop();
                    this.submitSubject.next({ data: system, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.blockUI.stop();
                    this.submitSubject.next({ data: this.element, error: err });
                });
        }
    }

    cancel() {
        this.cancelSubject.next();
    }

    toggleCreateResources() {
        this.createResources = !this.createResources;
    }
}
