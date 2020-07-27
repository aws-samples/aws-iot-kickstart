import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LogoutComponent, RegistrationConfirmationComponent } from './public/auth/confirm/confirm-registration.component'
import { ForgotPassword2Component, ForgotPasswordStep1Component } from './public/auth/forgot/forgot-password.component'
import { LoginComponent } from './public/auth/login/login.component'
import { NewPasswordComponent } from './public/auth/newpassword/new-password.component'
import { RegisterComponent } from './public/auth/register/registration.component'
import { ResendCodeComponent } from './public/auth/resend/resend-code.component'
// Public Routes
import { HomeComponent } from './public/home/home.component'
import { TestsComponent } from './public/tests/tests.component'
import { DeploymentsComponent } from './secure/deployments/deployments.component'
import { DeviceComponent } from './secure/devices/device.component'
import { DevicesComponent } from './secure/devices/devices.component'
import { SecureHomeComponent } from './secure/home/secure-home.component'
import { MapsComponent } from './secure/maps/maps.component'
import { ProfileComponent } from './secure/profile/profile.component'
// Secure Routes
import { SecureHomeLayoutComponent } from './secure/secure-home-layout.component'
import { SettingsComponent } from './secure/settings/settings.component'
import { UserComponent } from './secure/users/user.component'
import { UsersComponent } from './secure/users/users.component'
import { UserLoginService } from './services/user-login.service'

const homeRoutes: Routes = [
	{
		path: '',
		redirectTo: '/home/login',
		pathMatch: 'full',
	},
	{
		path: 'home',
		component: HomeComponent,
		children: [
			{ path: 'login', component: LoginComponent },
			{ path: 'register', component: RegisterComponent },
			{ path: 'confirmRegistration/:username', component: RegistrationConfirmationComponent },
			{ path: 'resendCode', component: ResendCodeComponent },
			{ path: 'forgotPassword/:email', component: ForgotPassword2Component },
			{ path: 'forgotPassword', component: ForgotPasswordStep1Component },
			{ path: 'newPassword', component: NewPasswordComponent },
			{ path: 'tests', component: TestsComponent },
		],
	},
]

const secureHomeRoutes: Routes = [
	{
		path: '',
		redirectTo: '/securehome',
		pathMatch: 'full',
	},
	{
		path: 'securehome',
		component: SecureHomeLayoutComponent,
		canActivate: [UserLoginService],
		children: [
			{ path: '', component: SecureHomeComponent },
			{ path: 'deployments', component: DeploymentsComponent },
			{ path: 'devices', component: DevicesComponent },
			{ path: 'devices/:thingId', component: DeviceComponent },
			{ path: 'logout', component: LogoutComponent },
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
		],
	},
]

const routes: Routes = [
	...homeRoutes,
	...secureHomeRoutes,
	{ path: '', component: HomeComponent },
]

@NgModule({
	// Use hash routing for CloudFront SPA support
	// https://codecraft.tv/courses/angular/routing/routing-strategies/#_hashlocationstrategy
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
