import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CognitoCallback, CognitoCallbackError } from '../../../services/user-login.service';
import { UserRegistrationService } from '../../../services/user-registration.service';
import { LoggerService } from '../../../services/logger.service';

// Helpers
declare var jquery: any;
declare var $: any;

export class RegistrationUser {
    name: string;
    email: string;
    password: string;
}
/**
 * This component is responsible for displaying and controlling
 * the registration of the user.
 */
@Component({
  selector: 'app-root',
  templateUrl: './registration.component.html'
})
export class RegisterComponent implements OnInit, CognitoCallback {
  registrationUser: RegistrationUser;
  errorMessage: string;

  constructor(public router: Router,
    public userRegistration: UserRegistrationService,
    private logger: LoggerService) {
  }

  ngOnInit() {
    this.registrationUser = new RegistrationUser();
    this.errorMessage = null;

    $('.owl-carousel').owlCarousel({
      slideSpeed: 300,
      paginationSpeed: 400,
      singleItem: !0,
      autoPlay: !0
    });
  }

  onRegister() {
    this.errorMessage = null;
    this.userRegistration.register(this.registrationUser, this);
  }

  cognitoCallback(error: CognitoCallbackError, result: any) {
    if (error != null) {
      // error
      this.errorMessage = error.message;
      this.logger.error('result: ' + this.errorMessage);
    } else {
      // success, move to the next step
      this.logger.info('redirecting');
      this.router.navigate(['/home/confirmRegistration', result.user.username]);
    }
  }
}
