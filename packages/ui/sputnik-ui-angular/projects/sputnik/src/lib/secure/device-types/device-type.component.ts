import { Component, NgZone } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import swal from 'sweetalert2'
// Models
import { DeviceType } from '../../models/device-type.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeviceTypeService } from '../../services/device-type.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-device-type',
	templateUrl: './device-type.component.html',
})
export class DeviceTypeComponent extends PageComponent {

		public pageTitle = 'Device Type';

		public deviceTypeId: string;

		public deviceType: DeviceType;

		constructor (
			userService: UserService,
			public router: Router,
			public route: ActivatedRoute,
			private breadCrumbService: BreadCrumbService,
			private deviceTypeService: DeviceTypeService,
			private logger: LoggerService,
			private ngZone: NgZone,
		) {
			super(userService)

			this.deviceTypeId = ''
			this.deviceType = undefined
		}

		ngOnInit () {
			super.ngOnInit()

			this.blockUI.start(`Loading ${this.pageTitle}...`)

			this.route.params.subscribe(params => {
				this.deviceTypeId = params.id

				this.breadCrumbService.setup(this.pageTitle, [
					new Crumb({
						title: this.pageTitle + 's',
						link: 'device-types',
					}),
					new Crumb({
						title: this.deviceTypeId,
						active: true,
					}),
				])

				this.loadDeviceType(this.deviceTypeId)

				this.blockUI.stop()
			})
		}

		private loadDeviceType (deviceTypeId) {
			this.deviceTypeService.deviceTypesObservable$.subscribe(message => {
				this.ngZone.run(() => {
					if (this.deviceTypeId !== 'new') {
						this.deviceType = this.deviceTypeService.deviceTypes.find(deviceType => {
							return deviceType.id === this.deviceTypeId
						})
					}
				})
			})

			if (this.deviceTypeId !== 'new') {
				this.deviceType = this.deviceTypeService.deviceTypes.find(deviceType => {
					return deviceType.id === this.deviceTypeId
				})
			} else {
				this.deviceType = new DeviceType()
			}
		}

		cancel () {
			this.router.navigate(['/device-types'])
		}

		submit (f) {
			console.log(f)

			if (this.deviceTypeId === 'new') {
				this.deviceTypeService
				.add(this.deviceType)
				.then(deviceType => {
					swal.fire({
						timer: 1000,
						title: 'Success',
						type: 'success',
						showConfirmButton: false,
					}).then(() => {
						this.logger.info('Created deviceType:', deviceType)
						this.router.navigate(['/device-types/' + deviceType.id])
					})
				})
				.catch(err => {
					swal.fire('Oops...', 'Something went wrong! In trying to create deviceType', 'error')
					this.logger.error('Error creating deviceType:', err)
				})
			} else {
				this.deviceTypeService
				.update(this.deviceType)
				.then(deviceType => {
					swal.fire({
						timer: 1000,
						title: 'Success',
						type: 'success',
						showConfirmButton: false,
					}).then(() => {
						this.logger.info('Updated deviceType:', deviceType)
						this.router.navigate(['/device-types/' + deviceType.id])
					})
				})
				.catch(err => {
					swal.fire('Oops...', 'Something went wrong! In trying to update deviceType', 'error')
					this.logger.error('Error creating deviceType:', err)
				})
			}
		}

		delete () {
			swal.fire({
				title: 'Are you sure you want to delete this device type?',
				text: 'You won\'t be able to revert this!',
				type: 'question',
				showCancelButton: true,
				cancelButtonColor: '#3085d6',
				confirmButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			}).then(result => {
				if (result.value) {
					this.blockUI.start('Deleting device type...')
					this.deviceTypeService
					.delete(this.deviceType.id)
					.then((resp: any) => {
						this.blockUI.stop()
						this.router.navigate(['/device-types'])
					})
					.catch(err => {
						this.blockUI.stop()
						swal.fire('Oops...', 'Something went wrong! Unable to delete the device type.', 'error')
						this.logger.error('error occurred calling deleteDeviceType api, show message')
						this.logger.error(err)
					})
				}
			})
		}
}
