import { Component, OnInit, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { NgForm } from '@angular/forms'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import swal from 'sweetalert2'
import { Device, DeviceFilterInput, DeviceBlueprint, DeviceType, BatchDeploymentResult } from '@deathstar/sputnik-core-api'
import { ApiService } from '@deathstar/sputnik-ui-angular-api'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { DeviceService } from '../../services/device.service'
import { DeviceBlueprintService } from '../../services/device-blueprint.service'
import { DeviceTypeService } from '../../services/device-type.service'
import { LoggerService } from '../../services/logger.service'
import { StatService } from '../../services/stat.service'
// Helpers
import moment from 'moment'
import { QueryRef } from 'apollo-angular'

declare let $: any

interface SimpleDeviceFilterInput {
	deviceBlueprintId?: string
	deviceTypeId?: string
}

function convertSimpleInput (simpleInput: SimpleDeviceFilterInput): DeviceFilterInput {
	const filterInput: DeviceFilterInput = {}

	if (simpleInput.deviceBlueprintId && simpleInput.deviceBlueprintId !== 'ALL') {
		filterInput.deviceBlueprint = { ids: [simpleInput.deviceBlueprintId] }
	}

	if (simpleInput.deviceTypeId && simpleInput.deviceTypeId !== 'ALL') {
		filterInput.deviceType = { ids: [simpleInput.deviceTypeId] }
	}

	return filterInput
}

@Component({
	selector: 'app-root-devices',
	templateUrl: './devices.component.html',
})
export class DevicesComponent implements OnInit {
	public title = 'Devices';

	public deviceStats: any = {};

	private profile: ProfileInfo = null;

	public devices: Device[]

	public newDevice: Partial<Device>;

	public filterInput: SimpleDeviceFilterInput = {}

	public deviceBlueprints: Observable<DeviceBlueprint[]>

	public deviceTypes: Observable<DeviceType[]>

	public selectAll = false

	public selectedDevices: { [key: string]: boolean, } = {}

	// public deviceTypes: DeviceType[] = [];
	public pages = {
		nextToken: null,
		current: 1,
		total: 0,
		pageSize: 50,
	};

	@BlockUI()
	blockUI: NgBlockUI;

	constructor (
	public router: Router,
	protected localStorage: LocalStorage,
	private logger: LoggerService,
	private breadCrumbService: BreadCrumbService,
	private deviceService: DeviceService,
	public deviceBlueprintService: DeviceBlueprintService,
	public deviceTypeService: DeviceTypeService,
	private statService: StatService,
	private apiService: ApiService,
	private ngZone: NgZone,
	) {}

	ngOnInit () {
		this.newDevice = {} // TODO: is this needed in init?

		this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
			this.profile = new ProfileInfo(profile)

			this.breadCrumbService.setup(this.title, [
				new Crumb({ title: this.title, active: true, link: 'devices' }),
			])

			this.queryDevices()

			this.deviceTypes = this.apiService.listDeviceTypesWatch().valueChanges.pipe(
				map(result => result.data.listDeviceTypes.deviceTypes),
			)

			this.deviceBlueprints = this.apiService.listDeviceBlueprintsWatch().valueChanges.pipe(
				map(result => result.data.listDeviceBlueprints.deviceBlueprints),
			)

			this.statService.statObservable$.subscribe(message => {
				this.deviceStats = message.deviceStats
				this.ngZone.run(() => {
					this.updatePaging()
				})
			})

			// TODO: not sure how to implement subscriptions with apollo-angular
			// https://www.apollographql.com/docs/angular/features/subscriptions/
			this.apiService.addedDevice().subscribe(({ data }) => {
				if (data.addedDevice) {
					this.devices = [...this.devices, data.addedDevice] as Device[]
				}
			})
		})
	}

	// TODO: make this debounced
	queryDevices () {
		this.blockUI.start('Loading devices...')

		this.apiService.devicesWatch({
			input: convertSimpleInput(this.filterInput),
			pagination: {
				limit: this.pages.pageSize,
				nextToken: this.pages.nextToken,
			},
		}).valueChanges.subscribe(({ data }) => {
			this.devices = data.devices.devices.slice() as Device[]

			this.pages.nextToken = data.devices.nextToken

			this.blockUI.stop()
		})
		// TODO: reset pagination and other stuff
	}

	updatePaging () {
		// console.log(this.pages.pageSize, this.deviceStats.total);
		this.pages.total = Math.ceil(this.deviceStats.total / this.pages.pageSize)
	}

	toggleSelectAll () {
		this.selectAll = !this.selectAll
		this.selectedDevices = {}
	}

	toggleDevice (thingId) {
		this.selectedDevices[thingId] = !this.selectedDevices[thingId]
	}

	async refreshData () {
		this.queryDevices()
	}

	openDevice (thingId: string) {
		this.router.navigate([['/securehome/devices', thingId].join('/')])
	}

	formatDate (dt: string) {
		if (dt) {
			return moment(dt).format('MMM Do YYYY')
		} else {
			return ''
		}
	}

	nextPage () {
		// this.pages.current++
		// this.blockUI.start('Loading device types...')
		// this.loadDevices()
	}

	previousPage () {
		// this.pages.current--
		// this.blockUI.start('Loading device types...')
		// this.loadDevices()
	}

	showCreateForm () {
		this.newDevice = {}
		$('#createModal').modal('show')
	}

	cancelCreateForm (form: NgForm) {
		form.reset()
		$('#createModal').modal('hide')
	}

	submitCreateDevice (value: any) {
		this.blockUI.start('Creating device...')

		this.deviceService
		.addDevice(this.newDevice.name)
		.then((device: Device) => {
			// this.loadDevices()
			$('#createModal').modal('hide')
		})
		.catch(err => {
			this.blockUI.stop()
			swal.fire('Oops...', 'Something went wrong! Unable to update the device.', 'error')
			this.logger.error('error occurred calling updateDevice api, show message')
			this.logger.error(err)
			// this.loadDevices()
		})
	}

	async deploy () {
		const thingIds = Object.entries(this.selectedDevices).reduce((devices, [thingId, selected]) => {
			if (selected) {
				return devices.concat(thingId)
			} else {
				return devices
			}
		}, [] as string[])

		const { value: confirmed } = await swal.fire({
			title: `Are you sure you want to deploy ${thingIds.length} devices?`,
			text: 'This will overwrite whatever the device is doing!',
			type: 'question',
			showCancelButton: true,
			cancelButtonColor: '#3085d6',
			confirmButtonColor: '#d33',
			confirmButtonText: 'Yes, deploy!',
		})

		if (confirmed !== true) {
			return
		}

		this.blockUI.start(`Deploying ${thingIds.length} devices`)

		try {
			const result = await this.apiService.addBatchDeployment({
				input: {
					ids: thingIds,
				},
			}).toPromise()
			this.logger.info('Batch deployment completed', result)

			const { success, deployments, message } = result.data.addBatchDeployment

			if (success) {
				swal.fire('Woo hoo!', message, 'success')
			} else {
				const failedDevices: BatchDeploymentResult[] = deployments.filter(deployment => !deployment.success)
				this.logger.warn('Partial deployment failed devices:', failedDevices)

				if (failedDevices.length === thingIds.length) {
					swal.fire('Oops...', message, 'error')
				} else {
					swal.fire('Almost', message, 'warning')
					// deselect successful devices
					this.selectAll = false
					deployments.forEach(deployment => {
						if (deployment.success) {
							this.selectedDevices[deployment.thingId] = false
						}
					})
				}
			}
		} catch (error) {
			this.logger.error('Batch deployment failed', error)
			swal.fire('Oops...', 'Failed to deploy devices', 'error')
		} finally {
			this.blockUI.stop()
		}
	}
}
