import { Component, OnInit } from '@angular/core'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import { ProfileInfo } from '../../models/profile-info.model'
import { UserService } from '../../services/user.service'

@Component({
	template: ''
})
export class PageComponent implements OnInit {

	public isAdminUser: boolean = false

	public profile: ProfileInfo = null;

	@BlockUI()
	protected blockUI: NgBlockUI;

	constructor (
		protected userService: UserService,
	) {}

	ngOnInit () {
		this.profile = this.userService.profileInfo
		this.isAdminUser = this.userService.isAdmin
	}
}
