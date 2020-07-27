import { Pipe, PipeTransform } from '@angular/core'
import { DeviceBlueprint } from '@deathstar/sputnik-ui-angular/app/models/device-blueprint.model'
import { DeviceBlueprintService } from '@deathstar/sputnik-ui-angular/app/services/device-blueprint.service'

@Pipe({ name: 'deviceBlueprintNameFromId', pure: true })
export class DeviceBlueprintNameFromIdPipe implements PipeTransform {
	constructor (private deviceBlueprintService: DeviceBlueprintService) {}

	transform (id: string): string {
		const index = this.deviceBlueprintService.deviceBlueprints.findIndex((db: DeviceBlueprint) => {
			return db.id === id
		})

		if (index !== -1) {
			return this.deviceBlueprintService.deviceBlueprints[index].name
		} else {
			return ''
		}
	}
}
