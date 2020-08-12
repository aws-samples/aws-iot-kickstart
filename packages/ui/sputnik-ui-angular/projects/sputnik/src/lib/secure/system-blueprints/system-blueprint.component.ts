import { Component, NgZone } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import swal from 'sweetalert2'
// Models
import { SystemBlueprint } from '../../models/system-blueprint.model'
// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service'
import { SystemBlueprintService } from '../../services/system-blueprint.service'
import { LoggerService } from '../../services/logger.service'
import { PageComponent } from '../common/page.component'
import { UserService } from '../../services/user.service'

@Component({
	selector: 'app-root-system-blueprint',
	templateUrl: './system-blueprint.component.html',
})
export class SystemBlueprintComponent extends PageComponent {

	public pageTitle = 'Device Type';

	public systemBlueprintId: string;

	public systemBlueprint: SystemBlueprint;

	constructor (
		userService: UserService,
		public router: Router,
		public route: ActivatedRoute,
		private breadCrumbService: BreadCrumbService,
		private systemBlueprintService: SystemBlueprintService,
		private logger: LoggerService,
		private ngZone: NgZone,
	) {
		super(userService)

		this.systemBlueprintId = ''
		this.systemBlueprint = undefined
	}

	ngOnInit () {
		super.ngOnInit()

		this.blockUI.start(`Loading ${this.pageTitle}...`)

		this.route.params.subscribe(params => {
			this.systemBlueprintId = params.id

			this.breadCrumbService.setup(this.pageTitle, [
				new Crumb({
					title: this.pageTitle + 's',
					link: '/system-blueprints',
				}),
				new Crumb({
					title: this.systemBlueprintId,
					active: true,
				}),
			])

			this.loadSystemBlueprint(this.systemBlueprintId)

			this.blockUI.stop()
		})
	}

	private loadSystemBlueprint (systemBlueprintId) {
		this.systemBlueprintService.systemBlueprintsObservable$.subscribe(message => {
			this.ngZone.run(() => {
				if (this.systemBlueprintId !== 'new') {
					this.systemBlueprint = this.systemBlueprintService.systemBlueprints.find(systemBlueprint => {
						return systemBlueprint.id === this.systemBlueprintId
					})
				}
			})
		})

		if (this.systemBlueprintId !== 'new') {
			this.systemBlueprint = this.systemBlueprintService.systemBlueprints.find(systemBlueprint => {
				return systemBlueprint.id === this.systemBlueprintId
			})
		} else {
			this.systemBlueprint = new SystemBlueprint()
		}
	}

	cancel () {
		this.router.navigate(['/system-blueprints'])
	}

	submit (f) {
		console.log(f)

		if (this.systemBlueprintId === 'new') {
			this.systemBlueprintService
			.add(this.systemBlueprint)
			.then(systemBlueprint => {
				swal.fire({
					timer: 1000,
					title: 'Success',
					type: 'success',
					showConfirmButton: false,
				}).then(() => {
					this.logger.info('Created systemBlueprint:', systemBlueprint)
					this.router.navigate(['/system-blueprints/' + systemBlueprint.id])
				})
			})
			.catch(err => {
				swal.fire('Oops...', 'Something went wrong! In trying to create systemBlueprint', 'error')
				this.logger.error('Error creating systemBlueprint:', err)
			})
		} else {
			this.systemBlueprintService
			.update(this.systemBlueprint)
			.then(systemBlueprint => {
				swal.fire({
					timer: 1000,
					title: 'Success',
					type: 'success',
					showConfirmButton: false,
				}).then(() => {
					this.logger.info('Updated systemBlueprint:', systemBlueprint)
					this.router.navigate(['/system-blueprints/' + systemBlueprint.id])
				})
			})
			.catch(err => {
				swal.fire('Oops...', 'Something went wrong! In trying to update systemBlueprint', 'error')
				this.logger.error('Error creating systemBlueprint:', err)
			})
		}
	}

	delete () {
		swal.fire({
			title: 'Are you sure you want to delete this system blueprint?',
			text: 'You won\'t be able to revert this!',
			type: 'question',
			showCancelButton: true,
			cancelButtonColor: '#3085d6',
			confirmButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		}).then(result => {
			if (result.value) {
				this.blockUI.start('Deleting system blueprint...')
				this.systemBlueprintService
				.delete(this.systemBlueprint.id)
				.then((resp: any) => {
					this.blockUI.stop()
					this.router.navigate(['/system-blueprints'])
				})
				.catch(err => {
					this.blockUI.stop()
					swal.fire('Oops...', 'Something went wrong! Unable to delete the system blueprint.', 'error')
					this.logger.error('error occurred calling deleteSystemBlueprint api, show message')
					this.logger.error(err)
				})
			}
		})
	}
}
