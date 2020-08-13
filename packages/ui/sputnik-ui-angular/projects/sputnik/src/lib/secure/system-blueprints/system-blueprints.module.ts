import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
// Components
import { TableModule } from '../../modules/table/table.module'
import { SystemBlueprintComponent } from './system-blueprint.component'
import { SystemBlueprintsComponent } from './system-blueprints.component'
// Pipes
import { PipesModule } from '../../pipes/pipes.module'
import { PrettyJsonModule } from '../../modules/pretty-json/pretty-json.module'

@NgModule({
	declarations: [SystemBlueprintComponent, SystemBlueprintsComponent],
	exports: [RouterModule, SystemBlueprintComponent, SystemBlueprintsComponent],
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
export class SystemBlueprintsModule {}
