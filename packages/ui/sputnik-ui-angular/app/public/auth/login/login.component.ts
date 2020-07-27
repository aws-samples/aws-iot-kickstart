import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { getEnvironment } from '@deathstar/sputnik-ui-angular/app/environment'
// Models
import { ProfileInfo } from '@deathstar/sputnik-ui-angular/app/models/profile-info.model'
// Services
import { LoggerService } from '@deathstar/sputnik-ui-angular/app/services/logger.service'
import {
	UserLoginService,
	CognitoCallback,
	LoggedInCallback,
	CognitoCallbackError,
} from '@deathstar/sputnik-ui-angular/app/services/user-login.service'

declare let appVariables: any

declare let jquery: any
declare let $: any

const environment = getEnvironment()

@Component({
	selector: 'app-root',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, CognitoCallback { //, LoggedInCallback {
	appName: string = environment.appName;

	email: string = null;

	password: string = null;

	errorMessage: string;

	constructor (public router: Router, public userService: UserLoginService, private logger: LoggerService) {
		this.logger.info('LoginComponent.constructor')
	}

	ngOnInit () {
		this.errorMessage = null
		this.logger.info(
			'LoginComponent.ngOnInit: Checking if the user is already authenticated. If so, then redirect to the secure site',
		)
	}

	onLogin () {
		if (this.email == null || this.password == null) {
			this.errorMessage = 'All fields are required'

			return
		}
		this.errorMessage = null
		this.userService.authenticate(this.email, this.password, this)
	}

	cognitoCallback (error: CognitoCallbackError, result: any) {
		if (error != null) {
		// error
			console.error(error)
			this.errorMessage = error.message
			this.logger.info('result: ' + this.errorMessage)

			if (this.errorMessage === 'User is not confirmed.') {
				this.logger.error('redirecting')
				this.router.navigate(['/home/confirmRegistration', this.email])
			} else if (this.errorMessage === 'User needs to set password.') {
				this.logger.error('redirecting to set new password')
				this.router.navigate(['/home/newPassword'])
			}
		} else {
		// success
			this.router.navigate(['/securehome'])
		}
	}
}
