import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { UserService } from '../../services/user.service'
import { LoggerService } from '../../services/logger.service'
import moment from 'moment'
import { PageComponent } from '../common/page.component'

@Component({
	selector: 'app-root',
	templateUrl: './profile.component.html',
})
export class ProfileComponent extends PageComponent {
	public cognitoId: string;

	public title = 'My Profile';

	public deviceStats: any = {};

	constructor (
		userService: UserService,
		public router: Router,
		public route: ActivatedRoute,
		protected localStorage: LocalStorage,
		private logger: LoggerService,
	) {
			super(userService)
		}

	ngOnInit () {
		super.ngOnInit()

		this.profile = this.userService.profileInfo
	}

	formatDate (dt: string) {
		console.log('formatDate')

		return moment(dt).format('MMM Do YYYY, h:mm:ss a')
	}
}
