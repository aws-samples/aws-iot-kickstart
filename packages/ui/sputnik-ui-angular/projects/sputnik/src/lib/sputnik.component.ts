import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { LoggerService } from './services/logger.service'
import { BlockUI, NgBlockUI } from 'ng-block-ui'

@Component({
	selector: 'app-root',
	templateUrl: './sputnik.component.html',
	styleUrls: ['./sputnik.component.css'],
})
export class SputnikComponent implements OnInit {
		@BlockUI() blockUI: NgBlockUI;

		constructor (public router: Router, private logger: LoggerService) {
			this.blockUI.start('Loading...')
		}

		ngOnInit () {
			this.logger.info('SputnikComponent: Checking if the user is already authenticated')
		}
}
