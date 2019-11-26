import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';

// Models
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { CognitoCallbackError, UserLoginService } from '@services/user-login.service';
import { UserRegistrationService } from '@services/user-registration.service';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  template: ''
})
export class LogoutComponent implements OnInit {
  constructor(public router: Router, protected localStorage: LocalStorage, public userService: UserLoginService) {}

  ngOnInit() {
    console.log('logging out and clearing local storage');
    this.localStorage.clear().subscribe(() => { });
    this.userService.logout();
    this.router.navigate(['/home/login']);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './confirm-registration.component.html'
})
export class RegistrationConfirmationComponent implements OnInit, OnDestroy {
  confirmationCode: string;
  email: string;
  errorMessage: string;
  private sub: any;

  constructor(public regService: UserRegistrationService, public router: Router, public route: ActivatedRoute) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['username'];
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

  onConfirmRegistration() {
    this.errorMessage = null;
    this.regService.confirmRegistration(this.email, this.confirmationCode, this);
  }

  cognitoCallback(error: CognitoCallbackError, result: any) {
    if (error != null) {
      // error
      this.errorMessage = error.message;
      console.log('message: ' + this.errorMessage);
    } else {
      // success, move to the next step
      console.log('Moving to securehome');
      this.router.navigate(['/securehome']);
    }
  }
}
