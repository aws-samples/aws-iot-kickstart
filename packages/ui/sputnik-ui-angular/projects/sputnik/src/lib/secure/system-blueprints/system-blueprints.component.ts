import { Component, NgZone, ComponentFactoryResolver } from '@angular/core'
import { Router } from '@angular/router'
// Models
import { SystemBlueprint } from '../../models/system-blueprint.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { SystemBlueprintService } from '../../services/system-blueprint.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-system-blueprints',
	templateUrl: './system-blueprints.component.html',
	// templateUrl: '../common/generic-table.component.html'
})
export class SystemBlueprintsComponent extends PageComponent {

	public tableData: SystemBlueprint[];

	public tableHeaders = [
		{ attr: 'name', name: 'Name' },
		{ attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
		{ attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
	];

	public totalSystemBlueprints: number;

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	public pageTitle = 'System Blueprints';


	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private systemBlueprintService: SystemBlueprintService,
		private logger: LoggerService,
		private ngZone: NgZone,
		private resolver: ComponentFactoryResolver,
	) {
		super(userService)

		this.totalSystemBlueprints = 0
		this.tableData = systemBlueprintService.systemBlueprints
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.breadCrumbService.setup(this.pageTitle, [
			new Crumb({ title: this.pageTitle, active: true, link: 'system-blueprints' }),
		])

		this.systemBlueprintService.systemBlueprintsObservable$.subscribe(systemBlueprints => {
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
		this.totalSystemBlueprints = this.systemBlueprintService.systemBlueprints.length
		this.pages.total = Math.ceil(this.totalSystemBlueprints / this.pages.pageSize)
	}

	refreshData () {
		this.blockUI.start(`Loading ${this.pageTitle}...`)
		this.systemBlueprintService.refresh()
		this.pages.current = 1
	}

	handleCreate () {
		this.router.navigate(['securehome/system-blueprints/new'])
	}
}
