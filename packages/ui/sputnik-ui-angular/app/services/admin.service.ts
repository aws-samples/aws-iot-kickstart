import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
// import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
// Models
import { Invitation } from '@deathstar/sputnik-ui-angular/app/models/invitation.model'
import { User } from '@deathstar/sputnik-ui-angular/app/models/user.model'
// Services
import { AppSyncService, AddedTenant } from '@deathstar/sputnik-ui-angular/app/services/appsync.service'
import { LoggerService } from '@deathstar/sputnik-ui-angular/app/services/logger.service'
import { Subject } from 'rxjs'
import { Group } from '../models/group.model'

// import { CognitoUtil } from './cognito.service';
// import { Group } from '../model/group';
// import { Setting } from '../model/setting';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';
// import 'rxjs/add/operator/toPromise';
// declare var appVariables: any;

@Injectable()
export class AdminService implements AddedTenant {
	public tenants: string[] = []

	private tenantSubject = new Subject<string[]>()

	public tenantsObservable = this.tenantSubject.asObservable()

	constructor (private appSyncService: AppSyncService, private logger: LoggerService) {
		this.appSyncService.onAddedTenant(this)

		this.listTenants()
	}

	public getUser (username: string) {
		return this.appSyncService.getUser(username)
	}

	public listGroups (limit = 0, nextToken: string = null) {
		return this.appSyncService.listGroups(limit, nextToken)
	}

	public listUsers (limit = 0, paginationToken: string = null) {
		return this.appSyncService.listUsers(limit, paginationToken)
	}

	public deleteUser (username: string) {
		return this.appSyncService.deleteUser(username)
	}

	public disableUser (username: string) {
		return this.appSyncService.disableUser(username)
	}

	public enableUser (username: string) {
		return this.appSyncService.enableUser(username)
	}

	public inviteUser (invite: Invitation) {
		return this.appSyncService.inviteUser(invite.name, invite.email, invite.groups)
	}

	public updateUser (username: string, groups: any) {
		return this.appSyncService.updateUser(username, groups)
	}

	public async listTenants () {
		this.tenants = await this.appSyncService.listTenants()
		this.tenantSubject.next(this.tenants)

		return this.tenants
	}

	public async addTenant (tenantName: string) {
		return this.appSyncService.addTenant(tenantName)
	}

	onAddedTenant (tenant: string) {
		this.tenants.push(tenant)
		this.tenantSubject.next(this.tenants)
	}

	// public getAllUsers() {

	// }

	//		constructor(private http: HttpClient, private cognito: CognitoUtil, private logger: LoggerService) {
	//		}

	//		public getAllUsers() {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.get<any>([appVariables.APIG_ENDPOINT, 'admin', 'users'].join('/'), {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														let users: User[] = [];
	//														users = data.map((user) => new User(user));
	//														resolve(users);
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public getUser(username: string) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.get<any>([appVariables.APIG_ENDPOINT, 'admin', 'users', username].join('/'), {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data: User) => {
	//														resolve(data);
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public getGroups() {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.get<any>([appVariables.APIG_ENDPOINT, 'admin', 'groups'].join('/'), {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														let groups: Group[] = [];
	//														groups = data.map((group) => new Group(group));
	//														resolve(groups);
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public disableUser(username: string) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.put<any>([appVariables.APIG_ENDPOINT, 'admin', 'users', username].join('/'), {
	//														'operation': 'disable'
	//												}, {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														resolve();
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public enableUser(username: string) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.put<any>([appVariables.APIG_ENDPOINT, 'admin', 'users', username].join('/'), {
	//														'operation': 'enable'
	//												}, {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														resolve();
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public deleteUser(username: string) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.delete<any>([appVariables.APIG_ENDPOINT, 'admin', 'users', username].join('/'), {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														resolve();
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public updateUser(user: User) {
	//				const _self = this;

	//				const _payload = {
	//						operation: 'update',
	//						user: {
	//								user_id: user.user_id,
	//								display_name: user.name,
	//								email: user.email,
	//								groups: user.groups
	//						}
	//				};

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.put<any>([appVariables.APIG_ENDPOINT, 'admin', 'users', user.user_id].join('/'), _payload, {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														resolve();
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public inviteUser(invite: Invitation) {
	//				const _self = this;

	//				const _payload = {
	//						name: invite.name,
	//						email: invite.email,
	//						groups: invite.groups
	//				};

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.post<any>([appVariables.APIG_ENDPOINT, 'admin', 'invitations'].join('/'), _payload, {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														resolve();
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public getSettings(settingId: string) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						const path = `settings?id=${settingId}`;

	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.get<any>([appVariables.APIG_ENDPOINT, 'admin', path].join('/'), {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data) => {
	//														let setting = new Setting(data);
	//														resolve(setting);
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												}
	//												);
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		public updateSettings(setting: Setting) {
	//				const _self = this;

	//				const promise = new Promise((resolve, reject) => {
	//						this.cognito.getIdToken({
	//								callback() {
	//								},
	//								callbackWithParam(token: any) {
	//										_self.http
	//												.put<any>([appVariables.APIG_ENDPOINT, 'admin', 'settings'].join('/'), setting, {
	//														headers: new HttpHeaders().set('Authorization', token)
	//												})
	//												.toPromise()
	//												.then((data: any) => {
	//														resolve(data);
	//												},
	//												(err: HttpErrorResponse) => {
	//														if (err.error instanceof Error) {
	//																// A client-side or network error occurred.
	//																_self.logger.error('An error occurred:', err.error.message);
	//														} else {
	//																// The backend returned an unsuccessful response code.
	//																// The response body may contain clues as to what went wrong,
	//																_self.logger.error(`Backend returned code ${err.status}, body was: ${err.error}`);
	//														}
	//														reject(err);
	//												});
	//								}
	//						});
	//				});

	//				return promise;
	//		}

	//		private handleError(error: Response | any) {
	//				console.error('ApiService::handleError', error);
	//				return Observable.throw(error);
	//		}
}
