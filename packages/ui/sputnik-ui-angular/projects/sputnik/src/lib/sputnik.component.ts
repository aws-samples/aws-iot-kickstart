import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { LoggerService } from './services/logger.service'

@Component({
	selector: 'sputnik',
	templateUrl: './sputnik.component.html',
	styleUrls: ['./sputnik.component.css'],
})
export class SputnikComponent implements OnInit, OnDestroy {

	constructor (public router: Router, private logger: LoggerService) {
	}

	ngOnInit () {
		this.logger.info('SputnikComponent: initialized')
	}

	ngOnDestroy() {
		this.logger.info('SputnikComponent: destroyed')
	}
}
