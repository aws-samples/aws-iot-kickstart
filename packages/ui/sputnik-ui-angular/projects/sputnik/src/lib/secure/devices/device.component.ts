import { Component, NgZone, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Device, DeviceType, DeviceBlueprint } from '@deathstar/sputnik-core-api'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
import { LocalStorage } from '@ngx-pwa/local-storage'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeploymentService } from '../../services/deployment.service'
import { LoggerService } from '../../services/logger.service'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import swal from 'sweetalert2'
import { contains, filter, clone, isEmpty } from 'underscore'
import { GetDeviceQuery, GetDeviceQueryVariables, ApiService, UpdateDeviceMutationVariables, ListDeviceBlueprintsQuery, ListDeviceBlueprintsQueryVariables, ListDeviceTypesQueryVariables, ListDeviceTypesQuery } from '@deathstar/sputnik-ui-angular-api'
import { QueryRef } from 'apollo-angular'
import { DeviceService } from '../../services/device.service'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

declare let $: any

function cleanDeviceVariables (variables: UpdateDeviceMutationVariables): UpdateDeviceMutationVariables {
	variables = clone(variables)

	if (isEmpty(variables.namespace)) {
		variables.namespace = DEFAULT_NAMESPACE
	}

	if (isEmpty(variables.spec)) {
		variables.spec = '{}'
	}

	return variables
}

@Component({
	selector: 'app-root-device',
	templateUrl: './device.component.html',
})
export class DeviceComponent extends PageComponent implements OnDestroy {
	public title = 'Device';

	public thingId: string;

	public device: GetDeviceQuery['getDevice']

	public deviceForEdit: UpdateDeviceMutationVariables

	public getDeviceQuery: QueryRef<GetDeviceQuery, GetDeviceQueryVariables>

	public deviceBlueprints: DeviceBlueprint[]

	public deviceBlueprintsForEdit: DeviceBlueprint[]

	public listDeviceBlueprintsQuery: QueryRef<ListDeviceBlueprintsQuery, ListDeviceBlueprintsQueryVariables>

	public deviceTypes: DeviceType[]

	public listDeviceTypesQuery: QueryRef<ListDeviceTypesQuery, ListDeviceTypesQueryVariables>

	public thingsboardDashboardLink: string

	constructor (
		userService: UserService,
		public router: Router,
		public route: ActivatedRoute,
		private _ngZone: NgZone,
		private logger: LoggerService,
		private breadCrumbService: BreadCrumbService,
		private deploymentService: DeploymentService,
		private deviceService: DeviceService,
		private apiService: ApiService,
	) {
		super(userService)
	}

	ngOnInit () {
		super.ngOnInit()

		this.route.params.subscribe(params => {
			this.thingId = params.thingId
		})

		this.breadCrumbService.setup(this.title, [
			new Crumb({
				title: 'Devices',
				link: '/devices',
			}),
			new Crumb({
				title: this.thingId,
				active: true,
			}),
		])

		this.blockUI.start('Loading device...')

		// devices
		this.getDeviceQuery = this.apiService.getDeviceWatch({
			thingId: this.thingId,
		})
		this.getDeviceQuery.valueChanges.subscribe(({ data }) => {
			this.device = data.getDevice
			this.blockUI.stop()
		})

		// device type
		this.listDeviceTypesQuery = this.apiService.listDeviceTypesWatch()
		this.listDeviceTypesQuery.valueChanges.subscribe(({ data }) => {
			this.deviceTypes = data.listDeviceTypes.deviceTypes
		})

		// blueprints
		this.listDeviceBlueprintsQuery = this.apiService.listDeviceBlueprintsWatch()
		this.listDeviceBlueprintsQuery.valueChanges.subscribe(({ data }) => {
			this.deviceBlueprints = data.listDeviceBlueprints.deviceBlueprints
		})
	}

	ngOnDestroy () {
		// this.logger.info('destroying device page, attempting to remove poller.')
	}

	public async refreshData () {
		try {
			this.blockUI.start('Loading device...')
			await Promise.all([
				this.getDeviceQuery.refetch(),
				this.listDeviceBlueprintsQuery.refetch(),
				this.listDeviceBlueprintsQuery.refetch(),
			])
		} finally {
			this.blockUI.stop()
		}
	}

	// async getDeviceBlueprint (): Promise<DeviceBlueprint> {
	// 	return (await this.apiService.getDeviceBlueprint({ id: this.device.deviceBlueprintId }).toPromise()).data.getDeviceBlueprint
	// }

	// private async initThingsboardDashboardLink () {
	// 	const entityId = this.device.metadata && this.device.metadata.thingsboardEntityId

	// 	if (entityId) {
	// 		const blueprint = await this.getDeviceBlueprint()
	// 		const thingsboardDashboard = blueprint.spec.thingsboardDashboard

	// 		if (!thingsboardDashboard) {
	// 			console.warn(`Device ${this.device.thingName} has "metadata.thingsboardEntityId" defined but blueprint missing "spec.thingsboardDashboard"`)

	// 			return
	// 		}

	// 		// Thingsboard state is base64 encoded JSON
	// 		const state = window.btoa(JSON.stringify([{
	// 			id: 'default',
	// 			params: {
	// 				entityId: {
	// 					id: entityId,
	// 					entityType: 'DEVICE',
	// 				},
	// 				entityName: this.device.thingName,
	// 				entityLabel: this.device.name || this.device.thingName,
	// 			},
	// 		}]))

	// 		this.thingsboardDashboardLink = `${thingsboardDashboard}?state=${state}`
	// 	}
	// }

	async submitEditDevice (value: any) {
		try {
			this.blockUI.start('Editing device...')
			const result = await this.apiService.updateDevice(cleanDeviceVariables(this.deviceForEdit)).toPromise()
			$('#editModal').modal('hide')
			console.log('Updated device:', result)
			this.device = result.data.updateDevice
		} catch (error) {
			swal.fire('Oops...', 'Something went wrong! Unable to update the device.', 'error')
			this.logger.error('error occurred calling updateDevice api, show message')
			this.logger.error(error)
			this.refreshData()
		} finally {
			this.blockUI.stop()
		}
	}

	async deleteDevice (device: Device) {
		const { value: confirmed } = await swal.fire({
			title: 'Are you sure you want to delete this device?',
			text: 'You won\'t be able to revert this!',
			type: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		})

		if (!confirmed) {
			return
		}

		try {
			this.blockUI.start('Deleting device...')
			const result = await this.apiService.deleteDevice({ thingId: device.thingId }).toPromise()

			if (result.errors) {
				swal.fire('Oops...', 'Something went wrong! Unable to delete the widget.', 'error')
				this.logger.error('Failed to delete device:', result.errors)
			} else {
				this.logger.info('Delete device result:', result)
				this.router.navigate(['/devices'])
			}
		} catch (error) {
			swal.fire('Oops...', 'Something went wrong! Unable to delete the widget.', 'error')
			this.logger.error('error occurred calling deleteDevice api, show message')
			this.logger.error(error)
		} finally {
			$('#editModal').modal('hide')
			this.refreshData()
			this.blockUI.stop()
		}
	}

	public async showEditForm () {
		this.deviceForEdit = clone(this.device) as UpdateDeviceMutationVariables
		this.deviceBlueprintsForEdit = await this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId)

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
						'error',
					)
					this.logger.error('error occurred calling addDeployment api, show message')
					this.logger.error(err)
				})
			}
		})
	}

	async filterDeviceBlueprintsForDeviceTypeId (deviceTypeId): Promise<DeviceBlueprint[]> {
		if (deviceTypeId === 'UNKNOWN') {
			return this.deviceBlueprints
		} else {
			return this.deviceBlueprints.filter(blueprint => {
				return blueprint.compatibility.includes('all') || blueprint.compatibility.includes(deviceTypeId)
			})
		}
	}

	public async deviceTypeChanged () {
		console.log('Changed device Type!', this.deviceForEdit.deviceTypeId)
		this.deviceBlueprintsForEdit = await this.filterDeviceBlueprintsForDeviceTypeId(this.deviceForEdit.deviceTypeId)
	}

	public async createCertificate () {
		try {
			this.blockUI.start('Generating certificate for device...')
			const cert = await this.deviceService.createCertificate(this.device as any)
			this.logger.info(cert)
			this.deviceService.createZip([cert as any])
		} catch (error) {
			swal.fire('Oops...', 'Something went wrong! Unable to create the certificate.', 'error')
			this.logger.error('error occurred calling createCertificate api, show message')
			this.logger.error(error)
		} finally {
			this.blockUI.stop()
		}
	}
}
