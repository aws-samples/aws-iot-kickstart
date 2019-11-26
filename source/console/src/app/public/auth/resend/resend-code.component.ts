import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CognitoCallback } from '../../../services/user-login.service';
import { UserRegistrationService } from '../../../services/user-registration.service';
import { LoggerService } from '../../../services/logger.service';

// Helpers
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './resend-code.component.html'
})
export class ResendCodeComponent implements OnInit, CognitoCallback {

  email: string;
  username: string;
  errorMessage: string;

  constructor(
    public registrationService: UserRegistrationService,
    public router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    $('.owl-carousel').owlCarousel({
      slideSpeed: 300,
      paginationSpeed: 400,
      singleItem: !0,
      autoPlay: !0
    });
  }

  resendCode() {
    this.username = this.email.replace('@', '_').replace('.', '_');
    this.registrationService.resendCode(this.username, this);
  }

  cognitoCallback(error: any, result: any) {
    if (error != null) {
      this.errorMessage = 'Something went wrong...please try again';
    } else {
      this.router.navigate(['/home/confirmRegistration', this.username]);
    }
  }
}
