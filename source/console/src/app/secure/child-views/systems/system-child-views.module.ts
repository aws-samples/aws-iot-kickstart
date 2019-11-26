import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '@models/device.model';
import { System } from '@models/system.model';

// Systems
import { DefaultSystemModule } from './default-system/default-system.module';

@Component({
    selector: 'app-system-child-view',
    template: `
        <div [ngSwitch]="data.system.systemBlueprintId" *ngIf="data && data.system && data.system.systemBlueprintId">
            <app-default-system *ngSwitchDefault [system]="data.system" [devices]="data.devices"></app-default-system>
        </div>
    `
})
export class SystemChildViewComponent {
    @Input() data: {
        system: System,
        devices: Device[]
    };// System = new System();
}

@NgModule({
    declarations: [SystemChildViewComponent],
    exports: [SystemChildViewComponent],
    imports: [CommonModule, DefaultSystemModule]
})
export class SystemChildViewsModule {}
