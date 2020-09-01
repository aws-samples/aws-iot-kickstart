import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components'
import { LoggerService } from './services/logger.service'

@Component({
	selector: 'app-root',
	template: `
		<amplify-authenticator *ngIf="authState !== 'signedin'" usernameAlias="email"></amplify-authenticator>

    <sputnik *ngIf="authState === 'signedin' && user"></sputnik>
	`,
	styles: [`
		amplify-authenticator {
			display: flex;
			justify-content: center;
			align-items: center;
			flex: 1;
			height: 100vh;
		}
	`],
})
export class SputnikAppComponent implements OnInit, OnDestroy {
	user: CognitoUserInterface | undefined

	authState: AuthState

	constructor (public router: Router, private logger: LoggerService, private ref: ChangeDetectorRef) {
	}

	ngOnInit () {
		this.logger.info('SputnikAppComponent: initialized')

		onAuthUIStateChange((authState, authData) => {
			this.authState = authState
			this.user = authData as CognitoUserInterface
			this.ref.markForCheck()

			if (authState === AuthState.SignedIn) {
				this.logger.info('SputnikAppComponent: User already signed in', authData)
				// TODO: integ token with apollo client
			}
		})
	}

	ngOnDestroy () {
		return onAuthUIStateChange
	}
}
