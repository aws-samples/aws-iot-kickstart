import {
	Component,
	NgZone,
	ViewChild,
	ViewContainerRef,
	ComponentFactoryResolver,
} from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs'
import swal from 'sweetalert2'
// SubComponents
import { SystemEditModalComponent } from './system.edit.modal.component'
// Models
import { Device } from '../../models/device.model'
import { System } from '../../models/system.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeploymentService } from '../../services/deployment.service'
import { DeviceService } from '../../services/device.service'
import { SystemService } from '../../services/system.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

declare let $: any

@Component({
	selector: 'app-root-system',
	templateUrl: './system.component.html',
})
export class SystemComponent extends PageComponent {
	public pageTitle = 'System';

	public id: string;

	public data: {
	system: System
	devices: Device[]
	};

	@ViewChild('editModalTemplate', { read: ViewContainerRef, static: true })
	editModalTemplate: ViewContainerRef;

	constructor (
		userService: UserService,
		private breadCrumbService: BreadCrumbService,
		private deploymentService: DeploymentService,
		private deviceService: DeviceService,
		private logger: LoggerService,
		private resolver: ComponentFactoryResolver,
		public route: ActivatedRoute,
		public router: Router,
		private systemService: SystemService,
		private ngZone: NgZone,
	) {
		super(userService)

		this.data = {
			system: new System(),
			devices: [],
		}
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start('Loading system...')

		this.route.params.subscribe(params => {
			this.data.system = new System({ id: params.id })

			this.breadCrumbService.setup(this.pageTitle, [
				new Crumb({
					title: this.pageTitle + 's',
					link: '/systems',
				}),
				new Crumb({
					title: this.data.system.id,
					active: true,
				}),
			])

			this.loadSystem()
		})
	}

	private loadSystem () {
		this.systemService
		.get(this.data.system.id)
		.then((system: System) => {
			this.data.system = system
			this.logger.info('Loaded system:', this.data.system.id)
			this.blockUI.stop()
			this.data.devices = []

			return Promise.all(
				this.data.system.deviceIds.map(thingId => {
					return this.deviceService.getDevice(thingId)
				}),
			)
		})
		.then(devices => {
			this.logger.info('Loaded', devices.length, 'devices.')
			this.data.devices = devices
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', 'Something went wrong! Unable to retrieve the system.', 'error')
			this.logger.error('error occurred calling getSystem api, show message')
			this.logger.error(err)
			this.router.navigate(['/systems'])
		})
	}

	public refresh () {
		this.blockUI.start('Loading system...')
		this.loadSystem()
	}

	public edit () {
		this.editModalTemplate.clear()

		const componentRef = this.editModalTemplate.createComponent(
			this.resolver.resolveComponentFactory(SystemEditModalComponent),
		)
		const componentRefInstance = <any>componentRef.instance

		const cancelSubject: Subject<void> = new Subject<void>()
		cancelSubject.subscribe(() => {
			this.handleCancelEdit()
			this.loadSystem()
		})
		const submitSubject: Subject<any> = new Subject<any>()
		submitSubject.subscribe(result => {
			if (result.error) {
				swal.fire('Oops...', 'Something went wrong!', 'error')
				this.logger.error('error occurred calling api, show message')
				this.logger.error(result.error)
			} else {
				swal.fire({
					timer: 1000,
					title: 'Success',
					type: 'success',
					showConfirmButton: false,
				}).then(() => {
					this.systemService.refreshSystem(this.data.system.id)
				})
			}
			this.handleCancelEdit()
			this.loadSystem()
		})

		const deleteSubject: Subject<any> = new Subject<any>()
		deleteSubject.subscribe(result => {
			if (result.error) {
				swal.fire('Oops...', 'Something went wrong! Unable to delete the system.', 'error')
				this.logger.error('error occurred calling deleteSystem api, show message')
				this.logger.error(result.error)
			} else {
				this.handleCancelEdit()
				this.router.navigate(['/systems'])
			}
		})

		componentRefInstance.cancelSubject = cancelSubject
		componentRefInstance.submitSubject = submitSubject
		componentRefInstance.deleteSubject = deleteSubject
		componentRefInstance.element = this.data.system
		$('#editSystemModal').modal('show')
	}

	private handleCancelEdit () {
		$('#editSystemModal').modal('hide')
		this.editModalTemplate.clear()
	}

	public deploy () {
		console.log('Deploy', this.data.system.deviceIds)
		swal.fire({
			title: 'Are you sure you want to deploy this system?',
			text: 'This will overwrite whatever the device is doing!',
			type: 'question',
			showCancelButton: true,
			cancelButtonColor: '#3085d6',
			confirmButtonColor: '#d33',
			confirmButtonText: 'Yes, deploy it!',
		}).then(result => {
			if (result.value) {
				this.blockUI.start('First refreshing the device spec for the system...')
				this.systemService
				.refreshSystem(this.data.system.id)
				.then(() => {
					this.blockUI.start('Deploying system...')

					return Promise.all(
						this.data.system.deviceIds.map(deviceId => {
							return this.deploymentService
							.addDeployment(deviceId)
							.then(deployment => {
								console.log(deployment)

								return deployment
							})
							.catch(err => {
								console.error(err)
								throw err
							})
						}),
					)
				})
				.then(results => {
					this.blockUI.stop()
					swal.fire({
						timer: 1000,
						title: 'Success',
						type: 'success',
						showConfirmButton: false,
					}).then()
				})
				.catch(err => {
					this.blockUI.stop()
					swal.fire('Oops...', 'Something went wrong! Unable to deploy the system.', 'error')
					this.logger.error('error occurred calling addDeployment api, show message')
					this.logger.error(err)
				})
			}
		})
	}

	public gotoDevice (device: Device) {
		this.router.navigate([['/devices', device.thingId].join('/')])
	}

	public createCertificate () {
		if (this.data.devices.length > 0) {
			this.blockUI.start('Generating certificates for devices...')

			Promise.all(
				this.data.devices.map(device => {
					return this.deviceService.createCertificate(device)
				}),
			)
			.then((certs: any) => {
				this.blockUI.stop()
				this.deviceService.createZip(certs)
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', 'Something went wrong! Unable to create the certificate.', 'error')
				this.logger.error('error occurred calling createCertificate api, show message')
				this.logger.error(err)
			})
		}
	}
}
