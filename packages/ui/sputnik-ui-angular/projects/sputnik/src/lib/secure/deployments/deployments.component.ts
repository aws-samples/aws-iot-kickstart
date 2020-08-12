import { Component, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import swal from 'sweetalert2'
// Models
import { Deployment } from '../../models/deployment.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { LoggerService } from '../../services/logger.service'
import { DeploymentService } from '../../services/deployment.service'
// Helpers
import moment from 'moment'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-deployments',
	templateUrl: './deployments.component.html',
})
export class DeploymentsComponent extends PageComponent {
	public title = 'Deployments';

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	public metrics: any = {
		total: 0,
	};

	public deployments: Deployment[] = [];

	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private logger: LoggerService,
		private _ngZone: NgZone,
		private deploymentService: DeploymentService,
	) {
		super(userService)
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start('Loading deployments...')

		this.breadCrumbService.setup(this.title, [
			new Crumb({ title: this.title, active: true, link: '/deployments' }),
		])

		this.loadDeployments()
	}

	updatePaging () {
		this.metrics.total = this.deployments.length
		// this.pages.total = Math.ceil(this.deviceStats.total / this.pages.pageSize);
	}

	loadDeployments () {
		return this.deploymentService
		.listDeployments(this.pages.pageSize, null)
		.then(results => {
			console.log(results)
			this.deployments = results.deployments
			this.updatePaging()
			this.blockUI.stop()
		})
		.catch(err => {
			swal.fire('Oops...', 'Something went wrong! Unable to retrieve the deployments.', 'error')
			this.logger.error('error occurred calling getDeployments api, show message')
			this.logger.error('the requested type doesnt exist')
			this.router.navigate(['/deployments'])
		})
	}

	refreshData () {
		this.blockUI.start('Loading devices...')
		this.loadDeployments()
	}

	openDevice (thingId: string) {
		this.router.navigate([['/deployments', thingId].join('/')])
	}

	formatDate (dt: string) {
		if (dt) {
			return moment(dt).format('MMM Do YYYY')
		} else {
			return ''
		}
	}

	nextPage () {
		this.pages.current++
		this.blockUI.start('Loading device types...')
		this.loadDeployments()
	}

	previousPage () {
		this.pages.current--
		this.blockUI.start('Loading device types...')
		this.loadDeployments()
	}
}
