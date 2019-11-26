import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';

@Component({
    selector: 'app-root-home',
    templateUrl: './secure-home.component.html'
})
export class SecureHomeComponent implements OnInit {
    public title = 'Home';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(public router: Router, private breadCrumbService: BreadCrumbService) {}

    ngOnInit() {
        const _self = this;
        _self.breadCrumbService.setup(_self.title, []);
        _self.blockUI.stop();
    }
}
