import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '@env/environment';

// Models
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { LoggerService } from '@services/logger.service';
import {
    UserLoginService,
    CognitoCallback,
    LoggedInCallback,
    CognitoCallbackError
} from '@services/user-login.service';

declare var appVariables: any;

declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, CognitoCallback { //, LoggedInCallback {
    appName: string = environment.appName;
    version: string = appVariables.VERSION;
    email: string = null;
    password: string = null;
    errorMessage: string;

    constructor(public router: Router, public userService: UserLoginService, private logger: LoggerService) {
        this.logger.info('LoginComponent.constructor');
    }

    ngOnInit() {
        this.errorMessage = null;
        this.logger.info(
            'LoginComponent.ngOnInit: Checking if the user is already authenticated. If so, then redirect to the secure site'
        );
    }

    onLogin() {
        if (this.email == null || this.password == null) {
            this.errorMessage = 'All fields are required';
            return;
        }
        this.errorMessage = null;
        this.userService.authenticate(this.email, this.password, this);
    }

    cognitoCallback(error: CognitoCallbackError, result: any) {
        if (error != null) {
            // error
            console.error(error);
            this.errorMessage = error.message;
            this.logger.info('result: ' + this.errorMessage);
            if (this.errorMessage === 'User is not confirmed.') {
                this.logger.error('redirecting');
                this.router.navigate(['/home/confirmRegistration', this.email]);
            } else if (this.errorMessage === 'User needs to set password.') {
                this.logger.error('redirecting to set new password');
                this.router.navigate(['/home/newPassword']);
            }
        } else {
            // success
            this.router.navigate(['/securehome']);
        }
    }
}
