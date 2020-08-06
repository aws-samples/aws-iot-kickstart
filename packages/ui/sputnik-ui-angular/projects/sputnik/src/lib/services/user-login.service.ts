import { CognitoUserSession } from 'amazon-cognito-identity-js'
import { Injectable, OnDestroy } from '@angular/core'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { Auth } from 'aws-amplify'
import { AmplifyService } from 'aws-amplify-angular'
import { LOCAL_STORAGE_TOKEN_KEY } from '@deathstar/sputnik-ui-angular-api'
// import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
// Models
import { ProfileInfo } from '../models/profile-info.model'
// Services
import { LoggerService } from './logger.service'

export interface CognitoCallbackError {
		message: string
		code?: string
		policy?: string
}

export interface CognitoCallback {
		cognitoCallback(error: CognitoCallbackError, result: any): void
}

export interface LoggedInCallback {
		isLoggedIn(message: string, loggedIn: boolean, profile: ProfileInfo): void
}

@Injectable()
export class UserLoginService implements CanActivate, OnDestroy {
	constructor (
				public amplifyService: AmplifyService,
				private router: Router,
				protected localStorage: LocalStorage,
				private logger: LoggerService,
	) {}

	// canActivate (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
	canActivate (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
		return this.isAuthenticated().then(result => {
			if (!result) {
				this.router.navigate(['/home/login'])
			}

			// this.startTokenRefreshTimer()
			this.refreshToken()

			return result
		}).catch(err => {
			this.logger.error(
				`UserLogiunService.canActivate: there was a problem with checking authentication ${err}`,
			)

			return false
		})
	}

	ngOnDestroy () {
		if (this._refreshTokenTimer) {
			clearTimeout(this._refreshTokenTimer)
		}
	}

	private _refreshTokenTimer: NodeJS.Timer

	private async startTokenRefreshTimer (session?: CognitoUserSession): Promise<void> {
		if (this._refreshTokenTimer) {
			clearTimeout(this._refreshTokenTimer)
		}

		session = session || await Auth.currentSession()

		const time = session.getIdToken().getExpiration() - 60 * 5
		this._refreshTokenTimer = setTimeout(() => this.refreshToken(), time)
		this.logger.info('started refresh token timer: ', time)
	}

	public async refreshToken (): Promise<void> {
    const session = await Auth.currentSession()
		const user = await Auth.currentAuthenticatedUser()

		user.refreshSession(session.getRefreshToken(), async () => {
    	await this.storeToken()
    })
	}

	public async storeToken () {
		const session = await Auth.currentSession()

		this.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, session.getIdToken().getJwtToken())
		this.startTokenRefreshTimer(session)
	}

	public async removeToken () {
		this.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
	}

	async authenticate (username: string, password: string, callback: CognitoCallback) {
		try {
			this.logger.info('UserLoginService.authenticate: starting the authentication')
			const user = await this.amplifyService.auth().signIn(username, password)
			this.logger.info('UserLoginService.authenticate: successfully logged in', user)

			this.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)

			if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				this.logger.warn('UserLoginService.authenticate: User needs to set password.')
				callback.cognitoCallback({
					message: 'User needs to set password.',
				}, null)
			} else {

				this.storeToken()

				try {
					const profileInfo: ProfileInfo = await this.getUserInfo()

					this.localStorage.setItem('profile', profileInfo).subscribe(() => {})
					callback.cognitoCallback(null, user)
				} catch (error) {
					this.logger.error('[Error] Error occurred retrieving user info to validate admin role.')
					this.logger.error(error)
					callback.cognitoCallback(null, user)
				}
			}
		} catch (error) {
			this.logger.error(error)
			// TODO: look into how callback is handled
			callback.cognitoCallback(error, null)
		}
	}

	forgotPassword (username: string, callback: CognitoCallback) {
		const self = this
		self.logger.info('UserLoginService.forgotPassword(', username, ')')
		self.amplifyService
		.auth()
		.forgotPassword(username)
		.then(data => {
			self.logger.info('UserLoginService.forgotPassword(', username, '):', data)
			callback.cognitoCallback(null, null)
		})
		.catch(err => {
			self.logger.info('UserLoginService.forgotPassword(', username, '): Error:', err)
			callback.cognitoCallback(err, null)
		})
	}

	confirmNewPassword (email: string, verificationCode: string, password: string, callback: CognitoCallback) {
		const self = this
		self.logger.info('UserLoginService.confirmNewPassword(', email, ',', verificationCode, ')')
		self.amplifyService
		.auth()
		.forgotPasswordSubmit(email, verificationCode, password)
		.then(data => {
			self.logger.info('UserLoginService.confirmNewPassword(', email, ',', verificationCode, '):', data)
			callback.cognitoCallback(null, null)
		})
		.catch(err => {
			self.logger.error(
				'UserLoginService.confirmNewPassword(',
				email,
				',',
				verificationCode,
				'): Errro:',
				err,
			)
			callback.cognitoCallback(err, null)
		})
	}

	changePassword (oldpassword: string, newpassword: string) {
		const self = this

		return self.amplifyService
		.auth()
		.currentAuthenticatedUser()
		.then(user => {
			return self.amplifyService
			.auth()
			.userSession(user)
			.then(session => {
				self.logger.info('UserLoginService.changePassword: Session is ' + session.isValid())

				if (session.isValid()) {
					return self.amplifyService.auth().changePassword(user, oldpassword, newpassword)
				} else {
					throw new Error('The users current session is invalid.')
				}
			})
		})
		.catch(err => {
			self.logger.warn('UserLoginService.changePassword: cant retrieve the current user')
			throw new Error('Cant retrieve the CurrentUser')
		})
	}

	logout () {
		this.logger.info('UserLoginService: Logging out')
		this.amplifyService.auth().signOut()
	}

	isAuthenticated () {
		const self = this

		return self.amplifyService
		.auth()
		.currentAuthenticatedUser()
		.then(user => {
			return self.amplifyService.auth().userSession(user)
		})
		.then(session => {
			self.logger.info(`UserLoginService.isAuthenticated(): Session is ${session.isValid()}`)

			return session.isValid()
		})
		.catch(err => {
			self.logger.warn(`UserLoginService.isAuthenticated(): cant retrieve the current authenticated user: ${err}`)

			return false
		})
	}

	getUserInfo () {
		const self = this

		self.logger.info('UserLoginService.getUserInfo')

		return self.amplifyService
		.auth()
		.currentSession()
		.then(session => {
			self.logger.info('UserLoginService.getUserInfo: session', session)
			const payload = session.getIdToken().decodePayload()
			const data = {
				user_id: payload['cognito:username'],
				email: payload.email,
				name: payload.nickname,
				enabled: payload.email_verified,
				groups: payload['cognito:groups'],
			}
			// const _decodedJwt = jwtDecode(session.getIdToken().getJwtToken());
			// const data = {
			//	user_id: _decodedJwt['cognito:username'],
			//	email: _decodedJwt.email,
			//	name: _decodedJwt.nickname,
			//	enabled: _decodedJwt.email_verified,
			//	groups: _decodedJwt['cognito:groups']
			// };
			self.logger.info('UserLoginService.getUserInfo:', data)

			return new ProfileInfo(data)
		})
		.catch(err => {
			self.logger.error('UserLoginService.getUserInfo: ERROR', err)
			throw new Error(err.message)
		})
	}
}
