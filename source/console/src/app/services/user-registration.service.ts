import { Inject, Injectable } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { RegistrationUser } from '@models/registration-user.model';
import { NewPasswordUser } from '@models/new-password-user.model';

// Services
import { LoggerService } from '@services/logger.service';
import { CognitoCallback } from '@services/user-login.service';

// TODO: test this whole flow cause not sure any of this works.

@Injectable()
export class UserRegistrationService {
  constructor(private logger: LoggerService, private amplifyService: AmplifyService) {}

  register(user: RegistrationUser, callback: CognitoCallback): void {
    this.logger.info('UserRegistrationService.register: user is', user);
    this.amplifyService
      .auth()
      .signUp({
        username: user.email.replace('@', '_').replace('.', '_'),
        password: user.password,
        attributes: {
          email: user.email,
          phone_number: '+1112223333',
          nickname: user.name
        }
      })
      .then(result => callback.cognitoCallback(null, result))
      .catch(err => callback.cognitoCallback(err, null));
  }

  confirmRegistration(username: string, confirmationCode: string, callback: CognitoCallback): void {
    this.logger.info('UserRegistrationService.confirmRegistration:', username, confirmationCode);
    this.amplifyService
      .auth()
      .confirmSignUp(username, confirmationCode, {
        forceAliasCreation: true
      })
      .then(result => callback.cognitoCallback(null, result))
      .catch(err => callback.cognitoCallback(err, null));
  }

  resendCode(username: string, callback: CognitoCallback): void {
    this.logger.info('UserRegistrationService.resendCode:', username);
    this.amplifyService
      .auth()
      .resendSignUp(username)
      .then(result => callback.cognitoCallback(null, result))
      .catch(err => callback.cognitoCallback(err, null));
  }

  newPassword(newPasswordUser: NewPasswordUser, callback: CognitoCallback): void {
    this.logger.info('UserRegistrationService.newPassword:', newPasswordUser);
    const username = newPasswordUser.email.replace('@', '_').replace('.', '_');

    const _self = this;

    _self.amplifyService
      .auth()
      .signIn(newPasswordUser.email, newPasswordUser.existingPassword)
      .then(user => {
        _self.logger.info('UserRegistrationService.newPassword:', user);
        return _self.amplifyService
          .auth()
          .completeNewPassword(user, newPasswordUser.password, user.challengeParam.requiredAttributes);
      })
      .then(user => callback.cognitoCallback(null, user))
      .catch(err => callback.cognitoCallback(err, null));
  }
}
