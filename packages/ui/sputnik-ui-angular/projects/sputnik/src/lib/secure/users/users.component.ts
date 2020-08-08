import { Component, Input, OnInit, ViewChild, NgZone } from '@angular/core'
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms'
import { Router } from '@angular/router'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import swal from 'sweetalert2'
import { INTERNAL_TENANT, UserGroups } from '@deathstar/sputnik-core'
import { User } from '@deathstar/sputnik-core-api'
import { ApiService, ListTenantsGQL, ListUsersGQL, ListUsersQuery, ListTenantsQuery } from '@deathstar/sputnik-ui-angular-api'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
import { Invitation } from '../../models/invitation-model'
// import { User } from '../../models/user.model'
// Services
import { AdminService } from '../../services/admin.service'
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { LoggerService } from '../../services/logger.service'
import { StatService, Stats } from '../../services/stat.service'
import { UserLoginService } from '../../services/user-login.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

declare let $: any

@Component({
	selector: 'app-root-users',
	templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
	// implements LoggedInCallback {

	//	 public deviceStats: any = {};

	public invite: Invitation;

	public profile: ProfileInfo;

	public isAdminUser = false;

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

	@BlockUI() blockUI: NgBlockUI;

	constructor (
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		// public userService: UserLoginService,
		private adminService: AdminService,
		protected localStorage: LocalStorage,
		private logger: LoggerService,
		private statService: StatService,
		private ngZone: NgZone,

		private apiService: ApiService,
		private listTenantGQL: ListTenantsGQL,
		private listUsersGQL: ListUsersGQL,
	) {
		this.invite = new Invitation()
		this.invite.name = ''
	}

	ngOnInit () {
		this.blockUI.start('Loading users...')

		this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
			this.profile = new ProfileInfo(profile)
			this.isAdminUser = this.profile.isAdmin()

			this.breadCrumbService.setup(this.pageTitle, [
				new Crumb({ title: this.pageTitle, active: true, link: 'users' }),
			])

			if (this.isAdminUser) {
				// this.loadUsers()

				this.users = this.listUsersGQL.watch().valueChanges.pipe(
					map(result => result.data.listUsers.users),
				)

				this.tenants = this.listTenantGQL.watch().valueChanges.pipe(
					map(result => result.data.listTenants),
				)

				// this.adminService.tenantsObservable.subscribe(tenants => {
				// 	this.tenants = tenants
				// })

				// this.apiService.

				// this.adminService.listTenants()
			}
		})

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

		//	 this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile) => {
		//	 this.profile = new ProfileInfo(profile);
		//	 this.isAdminUser = this.profile.isAdmin();
		//	 if (this.profile.isAdmin()) {
		//	 this.loadUsers();
		//	 }
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
		this.listUsersGQL.fetch()
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
