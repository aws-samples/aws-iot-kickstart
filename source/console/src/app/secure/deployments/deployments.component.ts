import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm, Validator } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { Deployment } from '@models/deployment.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { LoggerService } from '@services/logger.service';
import { DeploymentService } from '@services/deployment.service';

// Helpers
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-root-deployments',
    templateUrl: './deployments.component.html'
})
export class DeploymentsComponent implements OnInit {

    private profile: ProfileInfo = null;

    public title = 'Deployments';

    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public metrics: any = {
        total: 0
    };

    public deployments: Deployment[] = [];

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone,
        private deploymentService: DeploymentService
    ) {}

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading deployments...');

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({ title: _self.title, active: true, link: 'deployments' })
        ]);

        _self.loadDeployments();
    }

    updatePaging() {
        const _self = this;
        _self.metrics.total = _self.deployments.length;
        // _self.pages.total = Math.ceil(_self.deviceStats.total / _self.pages.pageSize);
    }

    loadDeployments() {
        const _self = this;

        return _self.deploymentService
            .listDeployments(_self.pages.pageSize, null)
            .then(results => {
                console.log(results);
                _self.deployments = results.deployments;
                _self.updatePaging();
                _self.blockUI.stop();
            })
            .catch(err => {
                swal.fire('Oops...', 'Something went wrong! Unable to retrieve the deployments.', 'error');
                _self.logger.error('error occurred calling getDeployments api, show message');
                _self.logger.error('the requested type doesnt exist');
                _self.router.navigate(['/securehome/deployments']);
            });
    }

    refreshData() {
        this.blockUI.start('Loading devices...');
        this.loadDeployments();
    }

    openDevice(thingId: string) {
        this.router.navigate([['/securehome/deployments', thingId].join('/')]);
    }

    formatDate(dt: string) {
        if (dt) {
            return moment(dt).format('MMM Do YYYY');
        } else {
            return '';
        }
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start('Loading device types...');
        this.loadDeployments();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start('Loading device types...');
        this.loadDeployments();
    }
}
