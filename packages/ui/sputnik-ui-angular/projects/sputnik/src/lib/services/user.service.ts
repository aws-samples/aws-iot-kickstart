import { CognitoUserSession, CognitoUser, CognitoIdToken, CognitoAccessToken } from 'amazon-cognito-identity-js'
import { Injectable } from '@angular/core'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { Auth } from 'aws-amplify'
import { AmplifyService } from 'aws-amplify-angular'
import { ProfileInfo } from '../models/profile-info.model'
import { LoggerService } from './logger.service'

@Injectable()
export class UserService {
	session: CognitoUserSession

	user: CognitoUser

	profileInfo: ProfileInfo

	idToken: CognitoIdToken

	accessToken: CognitoAccessToken

	jwtToken: string

	isAdmin: boolean

	constructor (
		protected localStorage: LocalStorage,
		private logger: LoggerService,
		private amplifyService: AmplifyService,
	) {

	}

	async init () {
		try {
			this.session = await Auth.currentSession()

			this.idToken = this.session.getIdToken()
			this.jwtToken = this.idToken.getJwtToken()
			this.accessToken = this.session.getAccessToken()
		} catch (error) {
			this.logger.error('[Auth.currentSession]', error)
		}

		try {
			this.user = await Auth.currentUserPoolUser()
		} catch (error) {
			this.logger.error('[Auth.currentUserPoolUser]', error)
		}

		try {
			this.profileInfo = await this.getUserInfo()
			this.isAdmin = this.profileInfo.isAdmin()
		} catch (error) {
			this.logger.error('[getUserInfo]', error)
		}
	}

	logout () {
		this.logger.info('UserService: Logging out')
		this.amplifyService.auth().signOut()
	}

	async getUserInfo () {
		this.logger.info('UserService.getUserInfo')

		this.logger.info('UserService.getUserInfo: session', this.session)
		const payload = this.session.getIdToken().decodePayload()
		const profileInfo = {
			user_id: payload['cognito:username'],
			email: payload.email,
			name: payload.nickname,
			enabled: payload.email_verified,
			groups: payload['cognito:groups'],
		}
		this.logger.info('UserService.getUserInfo:', profileInfo)

		this.localStorage.setItem('profile', profileInfo).subscribe(() => {})

		return new ProfileInfo(profileInfo)
	}
}
