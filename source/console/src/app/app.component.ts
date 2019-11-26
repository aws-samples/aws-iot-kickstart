import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from './services/logger.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;

    constructor(public router: Router, private logger: LoggerService) {
        this.blockUI.start('Loading...');
    }

    ngOnInit() {
        this.logger.info('AppComponent: Checking if the user is already authenticated');
    }
}
