import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
// Components
import { TableModule } from '../../modules/table/table.module'
import { DeviceBlueprintComponent } from './device-blueprint.component'
import { DeviceBlueprintsComponent } from './device-blueprints.component'
// Pipes
import { PipesModule } from '../../pipes/pipes.module'
import { PrettyJsonModule } from '../../modules/pretty-json/pretty-json.module'

@NgModule({
	declarations: [DeviceBlueprintComponent, DeviceBlueprintsComponent],
	exports: [RouterModule, DeviceBlueprintComponent, DeviceBlueprintsComponent],
	imports: [
		CommonModule,
		FormsModule,

		// Modules
		PrettyJsonModule,
		TableModule,

		// Pipes
		PipesModule,
	],
})
export class DeviceBlueprintsModule {}
