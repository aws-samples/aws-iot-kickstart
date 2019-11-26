import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '@models/device.model';

// Devices
import { DefaultDeviceModule } from './default-device/default-device.module';
import { MLDemoSqueezenetV10Module } from './ml-demo-squeezenet-v1.0/ml-demo-squeezenet-v1.0.module';

@Component({
    selector: 'app-device-child-view',
    template: `
        <div [ngSwitch]="device.deviceBlueprintId" *ngIf="device && device.deviceBlueprintId">
            <app-ml-demo-squeezenet-v1-0
                *ngSwitchCase="'ml-demo-squeezenet-v1.0'"
                [device]="device"
            ></app-ml-demo-squeezenet-v1-0>
            <app-default-device *ngSwitchDefault [device]="device"></app-default-device>
        </div>
    `
})
export class DeviceChildViewComponent {
    @Input() device: Device;
}

@NgModule({
    declarations: [DeviceChildViewComponent],
    exports: [DeviceChildViewComponent],
    imports: [CommonModule, DefaultDeviceModule, MLDemoSqueezenetV10Module]
})
export class DeviceChildViewsModule {}
