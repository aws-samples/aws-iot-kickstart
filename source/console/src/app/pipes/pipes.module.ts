import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { CertIdFromArnPipe } from '../pipes/cert-id-from-arn.pipe';
import { DeviceBlueprintNameFromIdPipe } from '../pipes/device-blueprint-name-from-id.pipe';
import { DeviceTypeNameFromIdPipe } from '../pipes/device-type-name-from-id.pipe';
import { FromNowPipe, FromNowValuePipe, MomentPipe, MomentToPipe } from '../pipes/moment.pipe';
import { SystemBlueprintFromSystemBlueprintIdPipe } from '../pipes/system-blueprint-from-system-blueprint-id.pipe';
import { StringifyPipe } from '../pipes/stringify.pipe';

@NgModule({
    declarations: [
        CertIdFromArnPipe,
        DeviceBlueprintNameFromIdPipe,
        DeviceTypeNameFromIdPipe,
        MomentPipe,
        SystemBlueprintFromSystemBlueprintIdPipe,
        FromNowPipe,
        FromNowValuePipe,
        MomentToPipe,
        StringifyPipe
    ],
    exports: [
        CertIdFromArnPipe,
        DeviceBlueprintNameFromIdPipe,
        DeviceTypeNameFromIdPipe,
        MomentPipe,
        SystemBlueprintFromSystemBlueprintIdPipe,
        FromNowPipe,
        FromNowValuePipe,
        MomentToPipe,
        StringifyPipe
    ]
})
export class PipesModule {}
