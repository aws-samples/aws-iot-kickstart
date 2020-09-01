import { COMPILER_OPTIONS, CompilerFactory, Compiler, NgModule, NO_ERRORS_SCHEMA, NgZone, APP_INITIALIZER } from '@angular/core'
import { JitCompilerFactory } from '@angular/platform-browser-dynamic'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
// import { RouterModule } from '@angular/router'
import { BlockUIModule } from 'ng-block-ui'
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2'
import { ChartsModule } from 'ng2-charts'
// import { SputnikRoutingModule } from './sputnik.routes'
// AWS Specific
// import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular'
// API
import { ApiService, ApiProviderModule } from '@deathstar/sputnik-ui-angular-api'
// import { ApiProviderModule } from './api.module'
// Config
import {
	APP_SYNC_GRAPHQL_ENDPOINT,
	REGION,
} from './app-variables'
// Components
import { SputnikComponent } from './sputnik.component'
import { IoTPubSuberComponent } from './secure/common/iot-pubsuber.component'
import { PrettifierComponent } from './secure/common/prettifier.component'
import { SecureHomeLayoutComponent } from './secure/secure-home-layout.component'
// Components - Secure
import { DeploymentsComponent } from './secure/deployments/deployments.component'
import { DeviceComponent } from './secure/devices/device.component'
import { DevicesComponent } from './secure/devices/devices.component'
import { MapsModule } from './secure/maps/maps.component'
import { ProfileComponent } from './secure/profile/profile.component'
import { SecureHomeComponent } from './secure/home/secure-home.component'
import { SettingsComponent } from './secure/settings/settings.component'
import { UserComponent } from './secure/users/user.component'
import { UsersComponent } from './secure/users/users.component'
// Pipes
import { PipesModule } from './pipes/pipes.module'
// Services
import { AppServicesModule } from './services/services.module'
import { LoggerService, ConsoleLoggerService } from './services/logger.service'
// Common Modules
import { GaugeModule } from './modules/gauge/gauge.module'
import { PrettyJsonModule } from './modules/pretty-json/pretty-json.module'
import { TableModule } from './modules/table/table.module'
// Secure Modules
import { DeviceBlueprintsModule } from './secure/device-blueprints/device-blueprints.module'
import { DeviceTypesModule } from './secure/device-types/device-types.module'
import { SystemsModule } from './secure/systems/systems.module'
import { SystemBlueprintsModule } from './secure/system-blueprints/system-blueprints.module'
// System Modules
import { ChildViewsModule } from './secure/child-views/child-views.module'
import { UserService } from './services/user.service'
import { PageComponent } from './secure/common/page.component'

// Addons compilation
export function createCompiler (fn: CompilerFactory): Compiler {
	return fn.createCompiler()
}

export function userFactory (config: UserService) {
	// Prevent "Metadata collected contains an error that will be reported at runtime: Lambda not supported."
	// https://medium.com/@thilanka.nuwan89/angular-lambda-not-supported-error-work-around-8f204f4cad9a
	const fn = () => config.init()

	return fn
}

@NgModule({
	declarations: [
		PageComponent,
		SputnikComponent,

		// Components - Secure - Common
		IoTPubSuberComponent,
		PrettifierComponent,

		// Components - Secure
		DeploymentsComponent,
		DeviceComponent,
		DevicesComponent,
		ProfileComponent,
		SecureHomeLayoutComponent,
		SecureHomeComponent,
		SettingsComponent,
		UserComponent,
		UsersComponent,
	],
	imports: [
		BrowserModule,
		FormsModule,
		// HttpModule,
		HttpClientModule,
		ReactiveFormsModule,
		// RouterModule,
		ChartsModule,

		// SputnikRoutingModule,

		// Common
		ChildViewsModule,
		GaugeModule,
		PrettyJsonModule,
		TableModule,

		// Secure
		DeviceBlueprintsModule,
		DeviceTypesModule,
		SystemsModule,
		SystemBlueprintsModule,

		BlockUIModule.forRoot(),
		SweetAlert2Module
		// eslint-disable-next-line func-call-spacing
		.forRoot
		//	{
		//	buttonsStyling: false,
		//	customClass: 'modal-content',
		//	confirmButtonClass: 'btn btn-primary',
		//	cancelButtonClass: 'btn'
		// }
		(),

		// Pipes
		PipesModule,

		// Services
		AppServicesModule,

		// API
		// ApolloModule,
		// ApiProviderModule,
		ApiProviderModule.forRoot({
			url: APP_SYNC_GRAPHQL_ENDPOINT,
			region: REGION,
		}),

		MapsModule,

		// .forRoot()
	],
	exports: [
		SputnikComponent,
		PageComponent,
	],
	providers: [
		{ provide: LoggerService, useClass: ConsoleLoggerService },
		{
			provide: COMPILER_OPTIONS,
			useValue: {},
			multi: true,
		},
		{
			provide: CompilerFactory,
			useClass: JitCompilerFactory,
			deps: [COMPILER_OPTIONS],
		},
		{
			provide: Compiler,
			useFactory: createCompiler,
			deps: [CompilerFactory],
		},
		UserService,
		{
			provide: APP_INITIALIZER,
			useFactory: userFactory,
			deps: [UserService],
			multi: true,
		},
	],
	bootstrap: [SputnikComponent],
	schemas: [NO_ERRORS_SCHEMA],
})
export class SputnikModule {}
