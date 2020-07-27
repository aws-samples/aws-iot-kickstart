import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// Pipes
import { CertIdFromArnPipe } from './cert-id-from-arn.pipe'
import { DeviceBlueprintNameFromIdPipe } from './device-blueprint-name-from-id.pipe'
import { DeviceTypeNameFromIdPipe } from './device-type-name-from-id.pipe'
import { FromNowPipe, FromNowValuePipe, MomentPipe, MomentToPipe } from './moment.pipe'
import { SystemBlueprintFromSystemBlueprintIdPipe } from './system-blueprint-from-system-blueprint-id.pipe'
import { StringifyPipe } from './stringify.pipe'

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
		StringifyPipe,
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
		StringifyPipe,
	],
})
export class PipesModule {}
