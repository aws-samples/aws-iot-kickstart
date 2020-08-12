import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core'
import { Router, NavigationExtras } from '@angular/router'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import { LocalStorage } from '@ngx-pwa/local-storage'
import swal from 'sweetalert2'
// Models
import { DeviceType } from '../../models/device-type.model'
import { ProfileInfo } from '../../models/profile-info.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeviceTypeService } from '../../services/device-type.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-device-types',
	templateUrl: './device-types.component.html',
	// templateUrl: '../common/generic-table.component.html'
})
export class DeviceTypesComponent extends PageComponent {
	public tableData: DeviceType[];

	public tableHeaders = [
		{ attr: 'type', name: 'type' },
		{ attr: 'name', name: 'Name' },
		{ attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
		{ attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
	];

	public totalDeviceTypes: number;

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	public pageTitle = 'Device Types';

	@BlockUI()
	blockUI: NgBlockUI;

	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private deviceTypeService: DeviceTypeService,
		private logger: LoggerService,
		private ngZone: NgZone,
		private resolver: ComponentFactoryResolver,
	) {
		super(userService)

		this.totalDeviceTypes = 0
		this.tableData = deviceTypeService.deviceTypes
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.breadCrumbService.setup(this.pageTitle, [
			new Crumb({ title: this.pageTitle, active: true, link: 'device-types' }),
		])

		this.deviceTypeService.deviceTypesObservable$.subscribe(deviceTypes => {
			this.ngZone.run(() => {
				this.load()
			})
		})

		this.load()
	}

	private load () {
		this.blockUI.stop()
		this.updatePaging()
	}

	private updatePaging () {
		this.totalDeviceTypes = this.deviceTypeService.deviceTypes.length
		this.pages.total = Math.ceil(this.totalDeviceTypes / this.pages.pageSize)
	}

	refreshData () {
		this.blockUI.start(`Loading ${this.pageTitle}...`)
		this.deviceTypeService.refresh()
		this.pages.current = 1
	}

	handleCreate () {
		this.router.navigate(['/device-types/new'])
	}
}
