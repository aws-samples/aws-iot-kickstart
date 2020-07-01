import { Component, NgZone, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { DeviceBlueprint } from '@models/device-blueprint.model'
// Models
import { Device } from '@models/device.model'
import { ProfileInfo } from '@models/profile-info.model'
import { LocalStorage } from '@ngx-pwa/local-storage'
// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service'
import { DeploymentService } from '@services/deployment.service'
import { DeviceBlueprintService } from '@services/device-blueprint.service'
import { DeviceTypeService } from '@services/device-type.service'
import { DeviceService } from '@services/device.service'
import { LoggerService } from '@services/logger.service'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import swal from 'sweetalert2'
import { contains, filter } from 'underscore'

declare var jquery: any
declare var $: any

@Component({
	selector: 'app-root-device',
	templateUrl: './device.component.html',
})
export class DeviceComponent implements OnInit, OnDestroy {
	public title = 'Device';

	public thingId: string;

	private profile: ProfileInfo = null;

	public isAdminUser: boolean;

	public device: Device = new Device();

	public deviceForEdit: Device = new Device();

	public deviceBlueprintsForEdit: DeviceBlueprint[] = [];

	public thingsboardDashboardLink: string

	@BlockUI()
	blockUI: NgBlockUI;

	constructor (
		public router: Router,
		public route: ActivatedRoute,
		protected localStorage: LocalStorage,
		private _ngZone: NgZone,
		private logger: LoggerService,
		private breadCrumbService: BreadCrumbService,
		private deploymentService: DeploymentService,
		private deviceService: DeviceService,
		public deviceBlueprintService: DeviceBlueprintService,
		public deviceTypeService: DeviceTypeService
	) {}

	ngOnInit () {
		this.route.params.subscribe(params => {
			this.thingId = params['thingId']
		})

		this.breadCrumbService.setup(this.title, [
			new Crumb({
				title: 'Devices',
				link: 'devices',
			}),
			new Crumb({
				title: this.thingId,
				active: true,
			}),
		])

		this.blockUI.start('Loading device...')

		this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
			this.profile = new ProfileInfo(profile)
			this.isAdminUser = this.profile.isAdmin()
			this.loadDevice()
			// this.pollerInterval = setInterval(function() {
			//     this.loadDevice();
			// }, environment.refreshInterval);
		})
	}

	ngOnDestroy () {
		// this.logger.info('destroying device page, attempting to remove poller.');
		// clearInterval(this.pollerInterval);
	}

	private loadDevice () {
		this.deviceService
			.getDevice(this.thingId)
			.then((device: Device) => {
				this.device = device
				this.blockUI.stop()
				this.initThingsboardDashboardLink()
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', 'Something went wrong! Unable to retrieve the device.', 'error')
				this.logger.error('error occurred calling getDevice api, show message')
				this.logger.error(err)
				this.router.navigate(['/securehome/devices'])
			})
	}

	public refreshData () {
		this.blockUI.start('Loading device...')
		this.loadDevice()
	}

	async getDeviceBlueprint (): Promise<DeviceBlueprint> {
		return this.deviceBlueprintService.get(this.device.deviceBlueprintId)
	}

	private async initThingsboardDashboardLink () {
		const entityId = this.device.metadata && this.device.metadata.thingsboardEntityId

		if (entityId) {
			const blueprint = await this.getDeviceBlueprint()
			const thingsboardDashboard = blueprint.spec.thingsboardDashboard

			if (!thingsboardDashboard) {
				console.warn(`Device ${this.device.thingName} has "metadata.thingsboardEntityId" defined but blueprint missing "spec.thingsboardDashboard"`)

				return
			}

			// Thingsboard state is base64 encoded JSON
			const state = window.btoa(JSON.stringify([{
				id: 'default',
				params: {
					entityId: {
						id: entityId,
						entityType: 'DEVICE',
					},
					entityName: this.device.thingName,
					entityLabel: this.device.name || this.device.thingName,
				},
			}]))

			this.thingsboardDashboardLink = `${thingsboardDashboard}?state=${state}`
		}
	}

	submitEditDevice (value: any) {
		this.blockUI.start('Editing device...')
		// console.log(JSON.stringify(this.deviceForEdit, null, 4));
		this.deviceService
			.updateDevice(this.deviceForEdit)
			.then((resp: any) => {
				$('#editModal').modal('hide')
				console.log('Updated device:', resp)
				this.device = new Device(resp)
				// this.getTheExtraResources();
				this.blockUI.stop()
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', 'Something went wrong! Unable to update the device.', 'error')
				this.logger.error('error occurred calling updateDevice api, show message')
				this.logger.error(err)
				this.loadDevice()
			})
	}

	deleteDevice (device: Device) {
		swal.fire({
			title: 'Are you sure you want to delete this device?',
			text: 'You won\'t be able to revert this!',
			type: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		}).then(result => {
			$('#editModal').modal('hide')

			if (result.value) {
				this.blockUI.start('Deleting device...')
				this.deviceService
					.deleteDevice(device.thingId)
					.then((resp: any) => {
						// console.log(resp);
						this.router.navigate(['/securehome/devices'])
					})
					.catch(err => {
						this.blockUI.stop()
						swal.fire('Oops...', 'Something went wrong! Unable to delete the widget.', 'error')
						this.logger.error('error occurred calling deleteDevice api, show message')
						this.logger.error(err)
						this.loadDevice()
					})
			}
		})
	}

	public showEditForm () {
		this.deviceForEdit = new Device(this.device)
		this.deviceBlueprintsForEdit = this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId)

		$('#editModal').modal('show')
	}

	public deploy () {
		console.log('Deploy', this.device.thingId)
		swal.fire({
			title: 'Are you sure you want to deploy this device?',
			text: 'This will overwrite whatever the device is doing!',
			type: 'question',
			showCancelButton: true,
			cancelButtonColor: '#3085d6',
			confirmButtonColor: '#d33',
			confirmButtonText: 'Yes, deploy it!',
		}).then(result => {
			if (result.value) {
				this.blockUI.start('Deploying device...')

				return this.deploymentService
					.addDeployment(this.device.thingId)
					.then(deployment => {
						console.log(deployment)
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
						swal.fire(
							'Oops...',
							'Unable to deploy the device. There could be an error in your blueprints.',
							'error'
						)
						this.logger.error('error occurred calling addDeployment api, show message')
						this.logger.error(err)
					})
			}
		})
	}

	filterDeviceBlueprintsForDeviceTypeId (deviceTypeId) {
		if (deviceTypeId === 'UNKNOWN') {
			return this.deviceBlueprintService.deviceBlueprints
		} else {
			return filter(this.deviceBlueprintService.deviceBlueprints, (deviceBlueprint: DeviceBlueprint) => {
				return (
					contains(deviceBlueprint.compatibility, deviceTypeId) ||
							contains(deviceBlueprint.compatibility, 'all')
				)
			})
		}
	}

	public deviceTypeChanged () {
		console.log('Changed device Type!', this.deviceForEdit.deviceTypeId)
		this.deviceBlueprintsForEdit = this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId)
	}

	public createCertificate () {
		this.blockUI.start('Generating certificate for device...')

		this.deviceService
			.createCertificate(this.device)
			.then((cert: any) => {
				this.logger.info(cert)
				this.blockUI.stop()
				this.deviceService.createZip([cert])
			})
			.catch(err => {
				this.blockUI.stop()
				swal.fire('Oops...', 'Something went wrong! Unable to create the certificate.', 'error')
				this.logger.error('error occurred calling createCertificate api, show message')
				this.logger.error(err)
			})
	}
}
