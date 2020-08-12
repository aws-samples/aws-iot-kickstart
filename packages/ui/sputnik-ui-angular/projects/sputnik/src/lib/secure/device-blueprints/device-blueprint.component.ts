import { Component, NgZone } from '@angular/core'
import { NgForm } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import swal from 'sweetalert2'
// Models
import { DeviceBlueprint } from '../../models/device-blueprint.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeviceBlueprintService } from '../../services/device-blueprint.service'
import { DeviceTypeService } from '../../services/device-type.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-device-blueprint',
	templateUrl: './device-blueprint.component.html',
})
export class DeviceBlueprintComponent extends PageComponent {
	public pageTitle = 'Device Blueprint';

	public deviceBlueprintId: string;

	public deviceBlueprint: DeviceBlueprint;

	constructor (
		userService: UserService,
		public router: Router,
		public route: ActivatedRoute,
		private breadCrumbService: BreadCrumbService,
		private deviceBlueprintService: DeviceBlueprintService,
		public deviceTypeService: DeviceTypeService,
		private logger: LoggerService,
		private ngZone: NgZone,
	) {
		super(userService)

		this.deviceBlueprintId = ''
		this.deviceBlueprint = undefined
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.route.params.subscribe(params => {
			this.deviceBlueprintId = params.id

			this.breadCrumbService.setup(this.pageTitle, [
				new Crumb({
					title: this.pageTitle + 's',
					link: 'device-blueprints',
				}),
				new Crumb({
					title: this.deviceBlueprintId,
					active: true,
				}),
			])

			this.loadDeviceBlueprint(this.deviceBlueprintId)

			this.blockUI.stop()
		})
	}

	private loadDeviceBlueprint (deviceBlueprintId) {
		this.deviceBlueprintService.deviceBlueprintsObservable$.subscribe(message => {
			this.ngZone.run(() => {
				if (this.deviceBlueprintId !== 'new') {
					this.deviceBlueprint = this.deviceBlueprintService.deviceBlueprints.find(deviceBlueprint => {
						return deviceBlueprint.id === this.deviceBlueprintId
					})
				}
			})
		})

		if (this.deviceBlueprintId !== 'new') {
			this.deviceBlueprint = this.deviceBlueprintService.deviceBlueprints.find(deviceBlueprint => {
				return deviceBlueprint.id === this.deviceBlueprintId
			})
		} else {
			this.deviceBlueprint = new DeviceBlueprint()
		}
	}

	cancel () {
		this.router.navigate(['/device-blueprints'])
	}

	submit (f) {
		console.log(f)

		if (this.deviceBlueprintId === 'new') {
			this.deviceBlueprintService
			.add(this.deviceBlueprint)
			.then(deviceBlueprint => {
				swal.fire({
					timer: 1000,
					title: 'Success',
					type: 'success',
					showConfirmButton: false,
				}).then(() => {
					this.logger.info('Created deviceBlueprint:', deviceBlueprint)
					this.router.navigate(['/device-blueprints/' + deviceBlueprint.id])
				})
			})
			.catch(err => {
				swal.fire('Oops...', 'Something went wrong! In trying to create deviceBlueprint', 'error')
				this.logger.error('Error creating deviceBlueprint:', err)
			})
		} else {
			this.deviceBlueprintService
			.update(this.deviceBlueprint)
			.then(deviceBlueprint => {
				swal.fire({
					timer: 1000,
					title: 'Success',
					type: 'success',
					showConfirmButton: false,
				}).then(() => {
					this.logger.info('Updated deviceBlueprint:', deviceBlueprint)
					this.router.navigate(['/device-blueprints/' + deviceBlueprint.id])
				})
			})
			.catch(err => {
				swal.fire('Oops...', 'Something went wrong! In trying to update deviceBlueprint', 'error')
				this.logger.error('Error creating deviceBlueprint:', err)
			})
		}
	}

	delete () {
		swal.fire({
			title: 'Are you sure you want to delete this device blueprint?',
			text: 'You won\'t be able to revert this!',
			type: 'question',
			showCancelButton: true,
			cancelButtonColor: '#3085d6',
			confirmButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		}).then(result => {
			if (result.value) {
				this.blockUI.start('Deleting device blueprint...')
				this.deviceBlueprintService
				.delete(this.deviceBlueprint.id)
				.then((resp: any) => {
					this.blockUI.stop()
					this.router.navigate(['/device-blueprints'])
				})
				.catch(err => {
					this.blockUI.stop()
					swal.fire('Oops...', 'Something went wrong! Unable to delete the device blueprint.', 'error')
					this.logger.error('error occurred calling deleteDeviceBlueprint api, show message')
					this.logger.error(err)
				})
			}
		})
	}

	inCompatibilityList (id: string) {
		if (this.deviceBlueprint.compatibility) {
			return (
				this.deviceBlueprint.compatibility.findIndex(devicetypetype => {
					return devicetypetype === id
				}) !== -1
			)
		} else {
			return false
		}
	}

	toggleDeviceType (event, id: string) {
		const index = this.deviceBlueprint.compatibility.indexOf(id)

		if (index === -1) {
			this.deviceBlueprint.compatibility.push(id)
		} else {
			this.deviceBlueprint.compatibility.splice(index, 1)
		}
		// this.logger.info(this.deviceBlueprint.compatibility);
		event.stopPropagation()
		event.preventDefault()
	}
}
