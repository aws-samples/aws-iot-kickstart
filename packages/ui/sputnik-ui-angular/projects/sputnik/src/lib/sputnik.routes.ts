import { NgModule } from '@angular/core'
import { RouterModule, Routes, PreloadAllModules } from '@angular/router'

import { DeploymentsComponent } from './secure/deployments/deployments.component'
import { DeviceComponent } from './secure/devices/device.component'
import { DevicesComponent } from './secure/devices/devices.component'
import { SecureHomeComponent } from './secure/home/secure-home.component'
import { MapsComponent } from './secure/maps/maps.component'
import { ProfileComponent } from './secure/profile/profile.component'
import { SecureHomeLayoutComponent } from './secure/secure-home-layout.component'
import { SettingsComponent } from './secure/settings/settings.component'
import { UserComponent } from './secure/users/user.component'
import { UsersComponent } from './secure/users/users.component'
import { DeviceTypesComponent } from './secure/device-types/device-types.component'
import { SystemsComponent } from './secure/systems/systems.component'
import { SystemBlueprintsComponent } from './secure/system-blueprints/system-blueprints.component'
import { DeviceBlueprintsComponent } from './secure/device-blueprints/device-blueprints.component'
import { Error404Component } from './secure/error/error-404.component'
import { DeviceBlueprintComponent } from './secure/device-blueprints/device-blueprint.component'
import { DeviceTypeComponent } from './secure/device-types/device-type.component'
import { SystemComponent } from './secure/systems/system.component'
import { SystemBlueprintComponent } from './secure/system-blueprints/system-blueprint.component'

const routes: Routes = [
	{
		path: '',
		component: SecureHomeLayoutComponent,
		children: [
			{ path: '', component: SecureHomeComponent },
			{ path: 'deployments', component: DeploymentsComponent },

			{ path: 'devices', component: DevicesComponent },
			{ path: 'devices/:thingId', component: DeviceComponent },

			{ path: 'maps', component: MapsComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'settings', component: SettingsComponent },
			{ path: 'users', component: UsersComponent },
			{ path: 'users/:username', component: UserComponent },

			{ path: 'device-blueprints', component: DeviceBlueprintsComponent },
			{ path: 'device-blueprints/:id', component: DeviceBlueprintComponent },

			{ path: 'device-types', component: DeviceTypesComponent },
			{ path: 'device-types/:id', component: DeviceTypeComponent },

			{ path: 'systems', component: SystemsComponent },
			{ path: 'systems/:id', component: SystemComponent },

			{ path: 'system-blueprints', component: SystemBlueprintsComponent },
			{ path: 'system-blueprints/:id', component: SystemBlueprintComponent },

			// 404 not found route
			{ path: '**', component: Error404Component },
		],
	},

	// 404 not found route
	{ path: '**', redirectTo: '/' },
]

@NgModule({
	declarations: [Error404Component],
	// Use hash routing for CloudFront SPA support
	// https://codecraft.tv/courses/angular/routing/routing-strategies/#_hashlocationstrategy
	imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, enableTracing: false })],
	exports: [RouterModule],
})
export class SputnikRoutingModule {}
