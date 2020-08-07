import { Component, OnInit, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators, NgForm, Validator } from '@angular/forms'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { BlockUI, NgBlockUI } from 'ng-block-ui'
import { Observable } from 'rxjs'
import { map, single } from 'rxjs/operators'
import swal from 'sweetalert2'
import { Device, DeviceFilterInput, DeviceBlueprint, DeviceType } from '@deathstar/sputnik-core-api'
import { ApiService, DevicesQuery, DevicesQueryVariables } from '@deathstar/sputnik-ui-angular-api'
// Models
import { ProfileInfo } from '../../models/profile-info.model'
// import { Device } from '../../models/device.model'
// import { DeviceType } from '../../models/device-type.model'
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
				map(result => result.data.listDeviceTypes.deviceTypes)
			)

			this.deviceBlueprints = this.apiService.listDeviceBlueprintsWatch().valueChanges.pipe(
				map(result => result.data.listDeviceBlueprints.deviceBlueprints)
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

			// this.deviceService.devicesObservable$.subscribe(device => {
			// 	this.ngZone.run(() => {
			// 		this.loadDevices()
			// 	})
			// })
		})

	// this.deviceTypeService.deviceTypesObservable$.subscribe(message => {
	//	 this.deviceTypes = message;
	//	 this.ngZone.run(() => {});
	// });
	}

	// TODO: make this debounced
	queryDevices () {
		this.blockUI.start('Loading devices...')

		this.apiService.devicesWatch({
			input: convertSimpleInput(this.filterInput),
			pagination: {
				limit: this.pages.pageSize,
				nextToken: this.pages.nextToken,
			}
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

	// loadDevices () {
	// 	const _self = this

	// 	this.statService.refresh()

	// 	return this.deviceService
	// 	.listDevices(this.pages.pageSize, null)
	// 	.then(results => {
	// 	// console.log(results);
	// 		this.devices = results.devices
	// 		this.updatePaging()
	// 		this.blockUI.stop()
	// 	})
	// 	.catch(err => {
	// 		swal.fire('Oops...', 'Something went wrong! Unable to retrieve the devices.', 'error')
	// 		this.logger.error('error occurred calling listDevices api, show message')
	// 		this.logger.error(err)
	// 		this.router.navigate(['/securehome/devices'])
	// 	})
	// }

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
}
