import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
// Components
import { SystemComponent } from './system.component'
import { SystemsComponent } from './systems.component'
import { SystemEditModalComponent } from './system.edit.modal.component'
import { SystemsModalComponent } from './systems.modal.component'
// Modules
import { ChildViewsModule } from '../child-views/child-views.module'
import { TableModule } from '../../modules/table/table.module'
import { PipesModule } from '../../pipes/pipes.module'
import { PrettyJsonModule } from '../../modules/pretty-json/pretty-json.module'

@NgModule({
	declarations: [SystemComponent, SystemsComponent, SystemEditModalComponent, SystemsModalComponent],
	entryComponents: [SystemEditModalComponent, SystemsModalComponent],
	exports: [RouterModule, SystemComponent, SystemsComponent],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,

		// Modules
		ChildViewsModule,
		PipesModule,
		PrettyJsonModule,
		TableModule,

	],
})
export class SystemsModule {}
