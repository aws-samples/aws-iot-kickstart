import { Component, NgZone, ComponentFactoryResolver } from '@angular/core'
import { Router } from '@angular/router'
// Models
import { DeviceBlueprint } from '../../models/device-blueprint.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeviceBlueprintService } from '../../services/device-blueprint.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-device-blueprints',
	templateUrl: './device-blueprints.component.html',
})
export class DeviceBlueprintsComponent extends PageComponent {

	public tableData: DeviceBlueprint[];

	public tableHeaders = [
		{ attr: 'type', name: 'type' },
		{ attr: 'name', name: 'Name' },
		{ attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
		{ attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
	];

	public totalDeviceBlueprints: number;

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	public pageTitle = 'Device Blueprints';

	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private deviceBlueprintService: DeviceBlueprintService,
		private logger: LoggerService,
		private ngZone: NgZone,
		private resolver: ComponentFactoryResolver,
	) {
		super(userService)

		this.totalDeviceBlueprints = 0
		this.tableData = deviceBlueprintService.deviceBlueprints
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.breadCrumbService.setup(this.pageTitle, [
			new Crumb({ title: this.pageTitle, active: true, link: '/device-blueprints' }),
		])

		this.deviceBlueprintService.deviceBlueprintsObservable$.subscribe(deviceBlueprints => {
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
		this.totalDeviceBlueprints = this.deviceBlueprintService.deviceBlueprints.length
		this.pages.total = Math.ceil(this.totalDeviceBlueprints / this.pages.pageSize)
	}

	refreshData () {
		this.blockUI.start(`Loading ${this.pageTitle}...`)
		this.deviceBlueprintService.refresh()
		this.pages.current = 1
	}

	handleCreate () {
		this.router.navigate(['/device-blueprints/new'])
	}
}
