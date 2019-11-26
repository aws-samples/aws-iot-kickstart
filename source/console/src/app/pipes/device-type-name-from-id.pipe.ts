import { Pipe, PipeTransform } from '@angular/core';

import { DeviceType } from '@models/device-type.model';

import { DeviceTypeService } from '@services/device-type.service';

@Pipe({ name: 'deviceTypeNameFromId', pure: true })
// export class DeviceTypeNameFromIdPipe implements PipeTransform {
//     transform(id: string, deviceTypes: DeviceType[]): string {
//         const index = deviceTypes.findIndex((dt: DeviceType) => {
//             return dt.id === id;
//         });
//         if (index !== -1) {
//             return deviceTypes[index].name;
//         } else {
//             return '';
//         }
//     }
// }
export class DeviceTypeNameFromIdPipe implements PipeTransform {

    constructor(private deviceTypeService: DeviceTypeService) {}

    transform(id: string): string {
        const index = this.deviceTypeService.deviceTypes.findIndex((dt: DeviceType) => {
            return dt.id === id;
        });
        if (index !== -1) {
            return this.deviceTypeService.deviceTypes[index].name;
        } else {
            return '';
        }
    }
}
