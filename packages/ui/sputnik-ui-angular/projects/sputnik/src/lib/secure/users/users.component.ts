import { Component, NgZone } from '@angular/core'
import {  NgForm } from '@angular/forms'
import { Router } from '@angular/router'
import { LocalStorage } from '@ngx-pwa/local-storage'
import swal from 'sweetalert2'
import { INTERNAL_TENANT, UserGroups } from '@deathstar/sputnik-core'
import { User } from '@deathstar/sputnik-core-api'
import { ApiService } from '@deathstar/sputnik-ui-angular-api'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
import { Invitation } from '../../models/invitation-model'
// Services
import { AdminService } from '../../services/admin.service'
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { LoggerService } from '../../services/logger.service'
import { StatService, Stats } from '../../services/stat.service'
import { UserService } from '../../services/user.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { PageComponent } from '../common/page.component'

declare let $: any

@Component({
	selector: 'app-root-users',
	templateUrl: './users.component.html',
})
export class UsersComponent extends PageComponent {
	// implements LoggedInCallback {

	//	 public deviceStats: any = {};

	public invite: Invitation;

	public pageTitle = 'Users';

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	// public users: User[] = [];

	// public tenants?: string[]

	//	 private name: string;

	users: Observable<User[]>

	tenants: Observable<string[]>

	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private adminService: AdminService,
		protected localStorage: LocalStorage,
		private logger: LoggerService,
		private statService: StatService,
		private ngZone: NgZone,

		private apiService: ApiService,
	) {
		super(userService)

		this.invite = new Invitation()
		this.invite.name = ''
	}

	ngOnInit () {
		super.ngOnInit()
		// this.blockUI.start('Loading users...')

		this.breadCrumbService.setup(this.pageTitle, [
			new Crumb({ title: this.pageTitle, active: true, link: '/users' }),
		])

		if (this.isAdminUser) {
			// this.loadUsers()

			this.users = this.apiService.listUsersWatch().valueChanges.pipe(
				map(result => result.data.listUsers.users),
			)

			this.tenants = this.apiService.listTenantsWatch().valueChanges.pipe(
				map(result => result.data.listTenants),
			)

			// this.adminService.tenantsObservable.subscribe(tenants => {
			// 	this.tenants = tenants
			// })

			// this.apiService.

			// this.adminService.listTenants()
		}

		// this.statService.statObservable$.subscribe((message: Stats) => {
		//	 this.dataStats = message.systemStats;
		//	 this.ngZone.run(() => { });
		// });
		// this.statService.refresh();

		//	 const this = this;
		//	 this.statsService.statObservable$.subscribe(message => {
		//	 this.deviceStats = message;
		//	 this._ngZone.run(() => { });
		//	 });
	}

	// loadUsers () {
	// 	// this.adminService
	// 	// .listUsers(this.pages.pageSize) // TODO: add pagination properly with the token etc ...
	// 	// .then((data: any) => {
	// 	// 	this.blockUI.stop()
	// 	// 	this.users = data.users
	// 	// })
	// 	// .catch(err => {
	// 	// 	this.blockUI.stop()
	// 	// 	swal.fire('Oops...', 'Something went wrong! Unable to retrieve the users.', 'error')
	// 	// 	this.logger.error('error occurred calling api, show message')
	// 	// 	this.logger.error(err)
	// 	// })
	// 	this.apiService.listUsers()
	// }

	refreshData () {
		this.blockUI.start('Loading users...')
		// this.loadUsers()
		// this.listUsersGQL.fetch()
	}

	cancelModal (form: NgForm) {
		form.reset()
		$('#inviteModal').modal('hide')
		$('#addTenantModal').modal('hide')
	}

	inviteUser (form: NgForm) {
		if (form.valid) {
			let group = form.value.group

			// Convert tenant to group for internal
			if (group === INTERNAL_TENANT) {
				group = UserGroups.MEMBERS
			}

			const _invite: Invitation = {
				name: form.value.name,
				email: form.value.email,
				// nickname: form.value.email,
				groups: [
					{
						name: group,
						_state: 'new',
					},
				],
			}

			this.blockUI.start('Inviting user...')
			$('#inviteModal').modal('hide')
			this.adminService
			.inviteUser(_invite)
			.then(result => {
				this.refreshData()
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', 'Something went wrong! Unable to invite the user.', 'error')
				this.logger.error('[error] Error occurred calling inviteUser API.')
				this.logger.error(err)
			})
		}
	}

	async addTenant (form: NgForm) {
		if (form.valid) {
			this.blockUI.start('Creating tenant...')

			const tenantName = form.value.name

			$('#addTenantModal').modal('hide')
			try {
				await this.adminService.addTenant(tenantName)
				swal.fire('Success', `Tenant "${tenantName}" successfully added`, 'success')
			} catch (error) {
				swal.fire('Oops...', 'Something went wrong! Unable to add tenant.', 'error')
				this.logger.error('[error] Error occurred calling addTenant API.')
				this.logger.error(error)
			} finally {
				this.blockUI.stop()
			}
		}
	}

	nextPage () {
		this.pages.current++
		this.blockUI.start('Loading users...')
		this.refreshData()
	}

	previousPage () {
		this.pages.current--
		this.blockUI.start('Loading users...')
		this.refreshData()
	}
}
