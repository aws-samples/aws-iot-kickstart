import { Pipe, PipeTransform } from '@angular/core';

import { DeviceBlueprint } from '@models/device-blueprint.model';

import { DeviceBlueprintService } from '@services/device-blueprint.service';

@Pipe({ name: 'deviceBlueprintNameFromId', pure: true })
export class DeviceBlueprintNameFromIdPipe implements PipeTransform {

    constructor(private deviceBlueprintService: DeviceBlueprintService) {}

    transform(id: string): string {
        const index = this.deviceBlueprintService.deviceBlueprints.findIndex((db: DeviceBlueprint) => {
            return db.id === id;
        });
        if (index !== -1) {
            return this.deviceBlueprintService.deviceBlueprints[index].name;
        } else {
            return '';
        }
    }
}
