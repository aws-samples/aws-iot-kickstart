import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { UserLoginService, CognitoCallback, CognitoCallbackError } from '../../../services/user-login.service';
import { LoggerService } from '../../../services/logger.service';

// Helpers
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordStep1Component implements OnInit, CognitoCallback {
  email: string;
  errorMessage: string;

  constructor(public router: Router,
    public userService: UserLoginService,
    private logger: LoggerService)
  {
    this.errorMessage = null;
  }

  ngOnInit() {
    $('.owl-carousel').owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: !0,
        autoPlay: !0
    });
  }

  onNext() {
    this.errorMessage = null;
    this.userService.forgotPassword(this.email, this);
  }

  cognitoCallback(error: CognitoCallbackError, result: any) {
    if (error == null && result == null) {
      // error
      this.router.navigate(['/home/forgotPassword', this.email]);
    } else {
      // success
      this.errorMessage = error.message;
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './forgot-password-step-2.component.html'
})
// export class ForgotPassword2Component implements CognitoCallback, OnInit, OnDestroy {
export class ForgotPassword2Component implements OnInit, OnDestroy {
  verificationCode: string;
  email: string;
  password: string;
  errorMessage: string;
  private sub: any;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public userService: UserLoginService,
    private logger: LoggerService
  ) {
    this.logger.info('email from the url: ' + this.email);
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];
    });
    this.errorMessage = null;

    $('.owl-carousel').owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: !0,
        autoPlay: !0
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onNext() {
    this.errorMessage = null;
    this.userService.confirmNewPassword(this.email, this.verificationCode, this.password, this);
  }

  cognitoCallback(error: CognitoCallbackError) {
    if (error != null) {
      // error
      this.errorMessage = error.message;
      this.logger.error('result: ' + this.errorMessage);
    } else {
      // success
      this.router.navigate(['/home/login']);
    }
  }
}
