import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

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
import { DeviceBlueprintComponent } from './secure/device-blueprints/device-blueprint.component'
import { DeviceTypeComponent } from './secure/device-types/device-type.component'
import { SystemsComponent } from './secure/systems/systems.component'
import { SystemBlueprintComponent } from './secure/system-blueprints/system-blueprint.component'

const secureHomeRoutes: Routes = [
	{
		path: '',
		redirectTo: '/securehome',
		pathMatch: 'full',
	},
	{
		path: 'securehome',
		component: SecureHomeLayoutComponent,
		children: [
			{ path: '', component: SecureHomeComponent },
			{ path: 'deployments', component: DeploymentsComponent },
			{ path: 'devices', component: DevicesComponent },
			{ path: 'devices/:thingId', component: DeviceComponent },
			// { path: 'logout', component: LogoutComponent },
			{ path: 'maps', component: MapsComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'settings', component: SettingsComponent },
			{ path: 'users', component: UsersComponent },
			{ path: 'users/:username', component: UserComponent },

			// Sub moduled paths :)
			{ path: 'device-blueprints', redirectTo: '/securehome/device-blueprints', pathMatch: 'full' },
			{ path: 'device-types', redirectTo: '/securehome/device-types', pathMatch: 'full' },
			{ path: 'systems', redirectTo: '/securehome/systems', pathMatch: 'full' },
			{ path: 'system-blueprints', redirectTo: '/securehome/system-blueprints', pathMatch: 'full' },
			// { path: 'device-blueprints', component: DeviceBlueprintComponent },
			// { path: 'device-types', component: DeviceTypeComponent },
			// { path: 'systems', component: SystemsComponent },
			// { path: 'system-blueprints', component: SystemBlueprintComponent },
		],
	},
]

const routes: Routes = [
	...secureHomeRoutes,
]

@NgModule({
	// Use hash routing for CloudFront SPA support
	// https://codecraft.tv/courses/angular/routing/routing-strategies/#_hashlocationstrategy
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule],
})
export class SputnikRoutingModule {}
