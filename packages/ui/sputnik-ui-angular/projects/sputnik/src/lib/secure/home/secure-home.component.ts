import { Component } from '@angular/core'
import { Router } from '@angular/router'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { PageComponent } from '../common/page.component';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-root-home',
	templateUrl: './secure-home.component.html',
})
export class SecureHomeComponent extends PageComponent {
		public title = 'Home';

		constructor (
			userService: UserService,
			public router: Router,
			private breadCrumbService: BreadCrumbService,
		) {
			super(userService)
		}

		ngOnInit () {
			super.ngOnInit()

			this.breadCrumbService.setup(this.title, [])
			this.blockUI.stop()
		}
}
