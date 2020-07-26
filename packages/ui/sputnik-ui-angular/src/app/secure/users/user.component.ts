import { Component, Input, OnInit, ViewChild, NgZone } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import swal from 'sweetalert2'
// Models
import { ProfileInfo } from '@models/profile-info.model'
import { User } from '@models/user.model'
// Services
import { AdminService } from '@services/admin.service'
import { LoggerService } from '@services/logger.service'
import { Subscription } from 'rxjs/Subscription'
import { filter } from 'underscore'

@Component({
	selector: 'app-root-user',
	templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {
	private profile: ProfileInfo;

	private sub: Subscription;

	private username: string;

	public groups: any = [];

	public isAdminUser = false;

	public title = 'User';

	public user: User = new User();

	// public cognitoId: string;
	// public deviceStats: any = {};

	@BlockUI() blockUI: NgBlockUI;

	constructor (
		public router: Router,
		public route: ActivatedRoute,
		// public userService: UserLoginService,
		private adminService: AdminService,
		protected localStorage: LocalStorage,
		private logger: LoggerService,
		// private statsService: StatsService,
		private ngZone: NgZone,
	) {}

	ngOnInit () {
		this.sub = this.route.params.subscribe(params => {
			this.username = params.username
			this.logger.info('username from the url: ' + this.username)
		})

		this.blockUI.start('Loading user...')

		// this.statsService.statObservable$.subscribe(message => {
		//	 this.deviceStats = message;
		//	 this._ngZone.run(() => {});
		// });
		// this.statsService.refresh();

		this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
			this.profile = new ProfileInfo(profile)
			this.isAdminUser = this.profile.isAdmin()

			if (this.profile.isAdmin()) {
				this
				.loadGroupData()
				.then(() => {
					this
					.loadUserData()
					.then(() => {
						this.blockUI.stop()
					})
					.catch(err => {
						console.error(err)
						this.blockUI.stop()
						swal.fire(
							'Oops...',
							`Something went wrong! Unable to retrieve the user ${this.username}.`,
							'error',
						)
					})
				})
				.catch(err => {
					console.error(err)
					this.blockUI.stop()
					swal.fire('Oops...', 'Something went wrong! Unable to retrieve the application groups.', 'error')
				})
			} else {
				this.blockUI.stop()
				this.router.navigate(['/securehome'])
			}
		})
	}

	loadUserData () {
		return this.adminService
		.getUser(this.username)
		.then((data: User) => {
			this.user = data
			this.title = ['User', data.name].join(': ')
			this.setCurrentGroups()
		})
		.catch(err => {
			this.logger.error('[error] Error occurred calling getUser API.')
			this.logger.error(err)
			throw err
		})
	}

	loadGroupData () {
		return this.adminService
		.listGroups()
		.then(data => {
			// TODO: deal with pagination in the case of too may groups !
			data.Groups.forEach(group => {
				this.groups.push({
					name: group.GroupName,
					isMember: false,
				})
			})
		})
		.catch(err => {
			this.logger.error('ERROR: Error occured calling listGroups api')
			this.logger.error(err)
			throw err
		})
	}

	setCurrentGroups () {
		this.user.groups.forEach(userGroup => {
			this.groups.forEach(group => {
				if (userGroup.name === group.name) {
					if (userGroup._state) {
						group.isMember = userGroup._state !== 'deleted'
					} else {
						group.isMember = true
					}
				}
			})
		})
	}

	setGroup (group: any) {
		const grp = filter(this.user.groups, function (o: any) {
			return o.name === group.name
		})

		if (grp.length > 0) {
			// this.user.groups = _.reject(this.user.groups, function(o: any) { return o.name === group.name; });
			grp[0]._state = 'deleted'
		} else {
			this.user.groups.push({
				name: group.name,
				_state: 'new',
			})
		}
	}

	disableUser () {
		this.blockUI.start('Disabling User...')
		this.adminService
		.disableUser(this.username)
		.then((data: User) => {
			this
			.loadUserData()
			.then(() => {
				this.blockUI.stop()
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', this.username, ' .'].join(''), 'error')
				this.logger.error('[error] Error occurred calling loadUserData API.')
				this.logger.error(err)
			})
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', ['Something went wrong! Unable to disable the user ', this.username, ' .'].join(''), 'error')
			this.logger.error('[error] Error occurred calling diableUser API.')
			this.logger.error(err)
		})
	}

	enableUser () {
		this.blockUI.start('Enabling User...')
		this.adminService
		.enableUser(this.username)
		.then((data: User) => {
			this
			.loadUserData()
			.then(() => {
				this.blockUI.stop()
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', this.username, ' .'].join(''), 'error')
				this.logger.error(err)
			})
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', ['Something went wrong! Unable to enable the user ', this.username, ' .'].join(''), 'error')
			this.logger.error('[error] Error occurred calling enableUser API.')
			this.logger.error(err)
		})
	}

	deleteUser () {
		this.blockUI.start('Deleting User...')
		this.adminService
		.deleteUser(this.username)
		.then(() => {
			this.blockUI.stop()
			this.router.navigate(['/securehome/users'])
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', ['Something went wrong! Unable to delete the user ', this.username, ' .'].join(''), 'error')
			this.logger.error('[error] Error occurred calling diableUser API.')
			this.logger.error(err)
		})
	}

	saveUser (user: User) {
		this.blockUI.start('Updating User...')
		this.adminService
		.updateUser(this.user.user_id, this.user.groups)
		.then((data: User) => {
			this
			.loadUserData()
			.then(() => {
				this.blockUI.stop()
				swal.fire('Complete.', [this.user.name, ' record was successfully updated..'].join(''), 'success')
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', this.username, ' .'].join(''), 'error')
				this.logger.error(err)
			})
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', ['Something went wrong! Unable to enable the user ', this.username, ' .'].join(''), 'error')
			this.logger.error('[error] Error occurred calling updateUser API.')
			this.logger.error(err)
		})
	}

	cancel () {
		this.router.navigate(['/securehome/users'])
	}
}
