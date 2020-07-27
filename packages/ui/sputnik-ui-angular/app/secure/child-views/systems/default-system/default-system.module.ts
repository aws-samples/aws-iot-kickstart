import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// Components
import { DefaultSystemComponent } from './default-system.component'
// Modules
import { DeviceChildViewsModule } from '../../devices/device-child-views.module'
import { WidgetsModule } from '@deathstar/sputnik-ui-angular/app/widgets/widgets.module'

@NgModule({
	declarations: [DefaultSystemComponent],
	exports: [DefaultSystemComponent],
	imports: [CommonModule, DeviceChildViewsModule, WidgetsModule],
	providers: [],
	schemas: [],
})
export class DefaultSystemModule {}
