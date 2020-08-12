import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular'
import { SputnikRoutingModule } from './sputnik.routes'
import { LoggerService, ConsoleLoggerService } from './services/logger.service'
import { SputnikAppComponent } from './app.component'
import { SputnikModule } from './sputnik.module'

@NgModule({
	declarations: [
		SputnikAppComponent,
	],
	imports: [
		AmplifyUIAngularModule,

		BrowserModule,
		RouterModule,
		SputnikRoutingModule,
		SputnikModule,
	],
	providers: [
		{ provide: LoggerService, useClass: ConsoleLoggerService },
	],
})
export class SputnikAppModule {}
