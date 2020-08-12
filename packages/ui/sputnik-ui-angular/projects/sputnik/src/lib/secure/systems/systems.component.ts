import { Component, NgZone, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'
import swal from 'sweetalert2'
// SubComponents
import { SystemsModalComponent } from './systems.modal.component'
// Models
import { System } from '../../models/system.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { SystemService } from '../../services/system.service'
import { StatService, Stats } from '../../services/stat.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

declare let $: any

@Component({
	selector: 'app-root-systems',
	templateUrl: './systems.component.html',
})
export class SystemsComponent extends PageComponent {
	public tableData: System[];

	public tableHeaders = [
		{ attr: 'name', name: 'Name' },
		{ attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
		{ attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
	];

	public totalSystems: number;

	public pages: any = {
		current: 1,
		total: 0,
		pageSize: 20,
	};

	public pageTitle = 'Systems';

	@ViewChild('createModalTemplate', { read: ViewContainerRef, static: true })
	createModalTemplate: ViewContainerRef;

	constructor (
		userService: UserService,
		public router: Router,
		private breadCrumbService: BreadCrumbService,
		private systemService: SystemService,
		private statService: StatService,
		private logger: LoggerService,
		private ngZone: NgZone,
		private resolver: ComponentFactoryResolver,
	) {
		super(userService)

		this.totalSystems = 0
		this.tableData = []
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.breadCrumbService.setup(this.pageTitle, [
			new Crumb({ title: this.pageTitle, active: true, link: 'systems' }),
		])

		this.statService.statObservable$.subscribe((message: Stats) => {
			this.ngZone.run(() => {
				this.totalSystems = message.systemStats.total
			})
		})

		this.statService.refresh()

		this.load()
	}

	private getSystems (ofPage: number, nextToken: string) {
		return this.systemService.list(this.pages.pageSize, nextToken).then(data1 => {
			if (ofPage === 0) {
				return data1
			} else if (data1.nextToken) {
				return this.getSystems(ofPage - 1, data1.nextToken).then(data2 => {
					return data2
				})
			} else {
				throw new Error('Something is wrong')
			}
		})
	}

	private load () {
		return this.getSystems(this.pages.current - 1, null)
		.then(results => {
			this.tableData = results.systems
			this.updatePaging()
			this.blockUI.stop()
		})
		.catch(err => {
			swal.fire('Oops...', 'Something went wrong! Unable to retrieve the systems.', 'error')
			this.logger.error('error occurred calling listSystems api')
			this.logger.error(err)
			this.router.navigate(['/systems'])
		})
	}

	private updatePaging () {
		this.pages.total = Math.ceil(this.totalSystems / this.pages.pageSize)
	}

	public refreshData () {
		this.blockUI.start(`Loading ${this.pageTitle}...`)
		this.pages.current = 1
		this.load()
	}

	public handleCreate () {
		this.createModalTemplate.clear()

		const componentRef = this.createModalTemplate.createComponent(this.resolver.resolveComponentFactory(SystemsModalComponent))
		const componentRefInstance = <any>componentRef.instance

		const cancelSubject: Subject<void> = new Subject<void>()
		cancelSubject.subscribe(() => {
			this.handleCancelCreate()
		})

		const submitSubject: Subject<any> = new Subject<any>()
		submitSubject.subscribe(result => {
			this.handleCancelCreate()

			if (result.error) {
				swal.fire('Oops...', 'Something went wrong!', 'error')
				this.logger.error('error occurred calling api, show message')
				this.logger.error(result.error)
			} else {
				swal.fire({ timer: 1000, title: 'Success', type: 'success', showConfirmButton: false }).then()
			}
			this.refreshData()
		})

		componentRefInstance.cancelSubject = cancelSubject
		componentRefInstance.submitSubject = submitSubject
		$('#createModalTemplate').modal('show')
	}

	private handleCancelCreate () {
		$('#createModalTemplate').modal('hide')
		this.createModalTemplate.clear()
	}
}
