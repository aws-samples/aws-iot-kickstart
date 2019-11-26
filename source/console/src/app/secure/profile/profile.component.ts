import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { _ } from 'underscore';
import * as moment from 'moment';

// Models
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { UserLoginService } from '@services/user-login.service';
import { LoggerService } from '@services/logger.service';

// Helpers
declare var jquery: any;
declare var $: any;
declare var swal: any;

@Component({
    selector: 'app-root',
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

    public cognitoId: string;
    public title = 'My Profile';
    public deviceStats: any = {};
    public profile: ProfileInfo = null;

    @BlockUI() blockUI: NgBlockUI;

    constructor(public router: Router,
        public route: ActivatedRoute,
        public userService: UserLoginService,
        protected localStorage: LocalStorage,
        private logger: LoggerService) {}

    ngOnInit() {

        const self = this;

        self.blockUI.start('Loading profile...');

        // this.localStorage.getItem<any>('deviceStats').subscribe((stats) => {
        //     self.deviceStats = stats;
        // });

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            // refresh profile info
            self.loadProfileData()
                .then(() => {
                    this.blockUI.stop();
                })
                .catch(err => {
                    this.blockUI.stop();
                    swal.fire('Oops...', "Something went wrong! Unable to retrieve the user's profile.", 'error');
                });
        });
    }

    loadProfileData() {
        const self = this;
        const promise = new Promise((resolve, reject) => {
            self.userService
                .getUserInfo()
                .then(data => {
                    self.profile = new ProfileInfo(data);
                    self.localStorage.setItem('profile', data).subscribe(() => {});
                    resolve();
                })
                .catch(err => {
                    self.logger.error('[error] Error occurred calling getUserInfo API.');
                    reject();
                });
        });
        return promise;
    }

    cancelPasswordChange(form: NgForm) {
        this.router.navigate(['/securehome']);
    }

    changePassword(form: NgForm) {
        this.userService.changePassword(form.value.oldpassword, form.value.newpassword).then((data: any) => {
            swal.fire(
                'Done...',
                'Your password has been successfully updated.',
                'success');
        }).catch((err) => {
            this.blockUI.stop();
            swal.fire(
                'Oops...',
                'Something went wrong! Unable to change your password.',
                'error');
        });
    }

    formatDate(dt: string) {
      console.log('formatDate');
        return moment(dt).format('MMM Do YYYY, h:mm:ss a');
    }

}
