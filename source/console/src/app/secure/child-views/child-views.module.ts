import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Systems
import { DeviceChildViewsModule } from './devices/device-child-views.module';
import { SystemChildViewsModule } from './systems/system-child-views.module';

@Component({
    selector: 'app-child-view',
    template: `
        <app-system-child-view *ngIf="type === 'system'" [data]="data"></app-system-child-view>
        <app-device-child-view *ngIf="type === 'device'" [device]="data"></app-device-child-view>
    `
})
export class ChildViewComponent {
    @Input() data: any;
    @Input() type: string;
}

@NgModule({
    declarations: [ChildViewComponent],
    exports: [ChildViewComponent],
    imports: [CommonModule, DeviceChildViewsModule, SystemChildViewsModule]
})
export class ChildViewsModule {}
