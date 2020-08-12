import { Component, NgZone } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import swal from 'sweetalert2'
// Models
import { User } from '../../models/user.model'
// Services
import { AdminService } from '../../services/admin.service'
import { UserService } from '../../services/user.service'
import { LoggerService } from '../../services/logger.service'
import { Subscription } from 'rxjs/Subscription'
import { filter } from 'underscore'
import { PageComponent } from '../common/page.component'

@Component({
	selector: 'app-root-user',
	templateUrl: './user.component.html',
})
export class UserComponent extends PageComponent {
	private sub: Subscription;

	private username: string;

	public groups: any = [];

	public isAdminUser = false;

	public title = 'User';

	public user: User = new User();

	// public cognitoId: string;
	// public deviceStats: any = {};

	constructor (
		userService: UserService,
		public router: Router,
		public route: ActivatedRoute,
		private adminService: AdminService,
		private logger: LoggerService,
		// private statsService: StatsService,
		private ngZone: NgZone,
	) {
		super(userService)
	}

	async ngOnInit () {
		await super.ngOnInit()

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

		this.profile = this.userService.profileInfo
		this.isAdminUser = this.userService.isAdmin

		if (this.profile.isAdmin()) {
			try {
				await this.loadGroupData()
				await this.loadUserData()
			} catch (error) {
				this.logger.error(error)
				swal.fire(
					'Oops...',
					`Something went wrong! Unable to retrieve the user ${this.username}.`,
					'error',
				)
			}
		}

		this.blockUI.stop()
	}

	async loadUserData () {
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

	async loadGroupData () {
		return this.adminService
		.listGroups()
		.then(data => {
			// TODO: deal with pagination in the case of too may groups !
			data.groups.forEach(group => {
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

	saveUser () {
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
