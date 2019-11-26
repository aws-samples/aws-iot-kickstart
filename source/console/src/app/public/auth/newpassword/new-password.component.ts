import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Models
import { NewPasswordUser } from '@models/new-password-user.model';

// Services
import { UserRegistrationService } from '@services/user-registration.service';
import { UserLoginService, CognitoCallback } from '@services/user-login.service';
import { LoggerService } from '@services/logger.service';

/**
 * This component is responsible for displaying and controlling
 * the registration of the user.
 */
@Component({
  selector: 'app-root-newpassword',
  templateUrl: './new-password.component.html'
})
export class NewPasswordComponent implements CognitoCallback {
  registrationUser: NewPasswordUser;
  router: Router;
  errorMessage: string;

  constructor(
    public userRegistration: UserRegistrationService,
    public userService: UserLoginService,
    router: Router,
    private logger: LoggerService
  ) {
    this.router = router;
    this.onInit();
  }

  onInit() {
    this.registrationUser = new NewPasswordUser();
    this.errorMessage = null;
    this.logger.info('Checking if the user is already authenticated. If so, then redirect to the secure site');
  }

  setPassword() {
    this.errorMessage = null;
    this.userRegistration.newPassword(this.registrationUser, this);
  }

  cognitoCallback(error: Error, result: any) {
    if (error != null) {
      // error
      console.error(error);
      this.errorMessage = error.message;
      this.logger.error('result: ' + this.errorMessage);
    } else {
      // success move to the next step
      this.logger.info('redirecting');
      this.router.navigate(['/securehome']);
    }
  }
}
