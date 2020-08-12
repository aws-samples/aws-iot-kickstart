import { NgModule, NO_ERRORS_SCHEMA, NgZone } from '@angular/core'
import * as sputnik from '@deathstar/sputnik-ui-angular'

@NgModule({
	imports: [
		sputnik.SputnikAppModule,
	],
	bootstrap: [sputnik.SputnikAppComponent],
	schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
