import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../../services/logger.service';

import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-root-home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;

    constructor(private logger: LoggerService) {
        // this.logger.info('HomeComponent.constructor');
    }

    ngOnInit() {
        // this.logger.info('HomeComponent.ngOnInit');
        this.blockUI.stop();
    }
}
