import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';

// import * as jwtDecode from 'jwt-decode';

// AWS
import { AmplifyService } from 'aws-amplify-angular';
// import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

// Models
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { LoggerService } from '@services/logger.service';

export interface CognitoCallbackError {
    message: string;
    code?: string;
    policy?: string;
}

export interface CognitoCallback {
    cognitoCallback(error: CognitoCallbackError, result: any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message: string, loggedIn: boolean, profile: ProfileInfo): void;
}

@Injectable()
export class UserLoginService implements CanActivate {
    constructor(
        public amplifyService: AmplifyService,
        private router: Router,
        protected localStorage: LocalStorage,
        private logger: LoggerService
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.isAuthenticated().then(result => {

            if (!result) {
                this.router.navigate(['/home/login']);
            }

            return result;

        }).catch(err => {
            this.logger.error(
                `UserLogiunService.canActivate: there was a problem with checking authentication ${err}`
            );
            return false;
        });
    }

    authenticate(username: string, password: string, callback: CognitoCallback) {
        const self = this;
        self.logger.info('UserLoginService.authenticate: starting the authentication');
        self.amplifyService
            .auth()
            .signIn(username, password)
            .then(user => {
                self.logger.info('UserLoginService.authenticate: successfully logged in', user);

                if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    self.logger.warn('UserLoginService.authenticate: User needs to set password.');
                    callback.cognitoCallback({
                        message: 'User needs to set password.'
                    }, null);
                } else {
                    self
                        .getUserInfo()
                        .then((data: ProfileInfo) => {
                            self.localStorage.setItem('profile', data).subscribe(() => {});
                            callback.cognitoCallback(null, user);
                        })
                        .catch(err2 => {
                            self.logger.error('[Error] Error occurred retrieving user info to validate admin role.');
                            self.logger.error(err2);
                            callback.cognitoCallback(null, user);
                        });
                }
            })
            .catch(err => {
                self.logger.error(err);
                callback.cognitoCallback(err, null);
            });
    }

    forgotPassword(username: string, callback: CognitoCallback) {
        const self = this;
        self.logger.info('UserLoginService.forgotPassword(', username, ')');
        self.amplifyService
            .auth()
            .forgotPassword(username)
            .then(data => {
                self.logger.info('UserLoginService.forgotPassword(', username, '):', data);
                callback.cognitoCallback(null, null);
            })
            .catch(err => {
                self.logger.info('UserLoginService.forgotPassword(', username, '): Error:', err);
                callback.cognitoCallback(err, null);
            });
    }

    confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback) {
        const self = this;
        self.logger.info('UserLoginService.confirmNewPassword(', email, ',', verificationCode, ')');
        self.amplifyService
            .auth()
            .forgotPasswordSubmit(email, verificationCode, password)
            .then(data => {
                self.logger.info('UserLoginService.confirmNewPassword(', email, ',', verificationCode, '):', data);
                callback.cognitoCallback(null, null);
            })
            .catch(err => {
                self.logger.error(
                    'UserLoginService.confirmNewPassword(',
                    email,
                    ',',
                    verificationCode,
                    '): Errro:',
                    err
                );
                callback.cognitoCallback(err, null);
            });
    }

    changePassword(oldpassword: string, newpassword: string) {
        const self = this;
        return self.amplifyService
            .auth()
            .currentAuthenticatedUser()
            .then(user => {
                return self.amplifyService
                    .auth()
                    .userSession(user)
                    .then(session => {
                        self.logger.info('UserLoginService.changePassword: Session is ' + session.isValid());
                        if (session.isValid()) {
                            return self.amplifyService.auth().changePassword(user, oldpassword, newpassword);
                        } else {
                            throw new Error('The users current session is invalid.');
                        }
                    });
            })
            .catch(err => {
                self.logger.warn('UserLoginService.changePassword: cant retrieve the current user');
                throw new Error('Cant retrieve the CurrentUser');
            });
    }

    logout() {
        this.logger.info('UserLoginService: Logging out');
        this.amplifyService.auth().signOut();
    }

    isAuthenticated() {
        const self = this;

        return self.amplifyService
            .auth()
            .currentAuthenticatedUser()
            .then(user => {
                return self.amplifyService.auth().userSession(user);
            })
            .then(session => {
                self.logger.info(`UserLoginService.isAuthenticated(): Session is ${session.isValid()}`);
                return session.isValid();
            })
            .catch(err => {
                self.logger.warn(`UserLoginService.isAuthenticated(): cant retrieve the current authenticated user: ${err}`);
                return false;
            });
    }


    getUserInfo() {
        const self = this;

        self.logger.info('UserLoginService.getUserInfo');

        return self.amplifyService
            .auth()
            .currentSession()
            .then(session => {
                self.logger.info('UserLoginService.getUserInfo: session', session);
                const payload = session.getIdToken().decodePayload();
                const data = {
                    user_id: payload['cognito:username'],
                    email: payload.email,
                    name: payload.nickname,
                    enabled: payload.email_verified,
                    groups: payload['cognito:groups']
                };
                // const _decodedJwt = jwtDecode(session.getIdToken().getJwtToken());
                // const data = {
                //   user_id: _decodedJwt['cognito:username'],
                //   email: _decodedJwt.email,
                //   name: _decodedJwt.nickname,
                //   enabled: _decodedJwt.email_verified,
                //   groups: _decodedJwt['cognito:groups']
                // };
                self.logger.info('UserLoginService.getUserInfo:', data);
                return new ProfileInfo(data);
            })
            .catch(err => {
                self.logger.error('UserLoginService.getUserInfo: ERROR', err);
                throw new Error(err.message);
            });
    }
}
