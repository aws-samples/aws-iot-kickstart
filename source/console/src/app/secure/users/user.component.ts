import { Component, Input, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { Group } from '@models/group.model';
import { ProfileInfo } from '@models/profile-info.model';
import { User } from '@models/user.model';

// Services
import { AdminService } from '@services/admin.service';
import { LoggerService } from '@services/logger.service';
import { StatService } from '@services/stat.service';
import { Subscription } from 'rxjs/Subscription';
import { UserLoginService } from '@services/user-login.service';

import { _ } from 'underscore';
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-root-user',
    templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
    private profile: ProfileInfo;
    private sub: Subscription;
    private username: string;

    public groups: any = [];
    public isAdminUser = false;
    public title = 'User';
    public user: User = new User();

    // public cognitoId: string;
    // public deviceStats: any = {};

    @BlockUI() blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        // public userService: UserLoginService,
        private adminService: AdminService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        // private statsService: StatsService,
        private ngZone: NgZone
    ) {}

    ngOnInit() {
        const _self = this;

        _self.sub = _self.route.params.subscribe(params => {
            _self.username = params['username'];
            _self.logger.info('username from the url: ' + _self.username);
        });

        _self.blockUI.start('Loading user...');

        // this.statsService.statObservable$.subscribe(message => {
        //     this.deviceStats = message;
        //     this._ngZone.run(() => {});
        // });
        // this.statsService.refresh();

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);
            _self.isAdminUser = _self.profile.isAdmin();
            if (_self.profile.isAdmin()) {
                _self
                    .loadGroupData()
                    .then(() => {
                        _self
                            .loadUserData()
                            .then(() => {
                                _self.blockUI.stop();
                            })
                            .catch(err => {
                                _self.blockUI.stop();
                                swal.fire(
                                    'Oops...',
                                    `Something went wrong! Unable to retrieve the user ${_self.username}.`,
                                    'error'
                                );
                            });
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal.fire('Oops...', 'Something went wrong! Unable to retrieve the application groups.', 'error');
                    });
            } else {
                _self.blockUI.stop();
                _self.router.navigate(['/securehome']);
            }
        });
    }

    loadUserData() {
        const _self = this;

        return _self.adminService
            .getUser(_self.username)
            .then((data: User) => {
                _self.user = data;
                _self.title = ['User', data.name].join(': ');
                _self.setCurrentGroups();
                return;
            })
            .catch(err => {
                _self.logger.error('[error] Error occurred calling getUser API.');
                _self.logger.error(err);
                throw err;
            });
    }

    loadGroupData() {
        const _self = this;
        return this.adminService
            .listGroups()
            .then(data => {
                // TODO: deal with pagination in the case of too may groups !
                data.Groups.forEach(group => {
                    _self.groups.push({
                        name: group.GroupName,
                        isMember: false
                    });
                });
                return;
            })
            .catch(err => {
                _self.logger.error('ERROR: Error occured calling listGroups api');
                _self.logger.error(err);
                throw err;
            });
    }

    setCurrentGroups() {
        this.user.groups.forEach(userGroup => {
            this.groups.forEach(group => {
                if (userGroup.name === group.name) {
                    if (userGroup._state) {
                        group.isMember = userGroup._state !== 'deleted';
                    } else {
                        group.isMember = true;
                    }
                }
            });
        });
    }

    setGroup(group: any) {
        const grp = _.filter(this.user.groups, function(o: any) {
            return o.name === group.name;
        });
        if (grp.length > 0) {
            // this.user.groups = _.reject(this.user.groups, function(o: any) { return o.name === group.name; });
            grp[0]._state = 'deleted';
        } else {
            this.user.groups.push({
                name: group.name,
                _state: 'new'
            });
        }
    }

    disableUser() {
        const _self = this;
        _self.blockUI.start('Disabling User...');
        _self.adminService
            .disableUser(this.username)
            .then((data: User) => {
                _self
                    .loadUserData()
                    .then(() => {
                        _self.blockUI.stop();
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', _self.username, ' .'].join(''), 'error');
                        _self.logger.error('[error] Error occurred calling loadUserData API.');
                        _self.logger.error(err);
                    });
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', ['Something went wrong! Unable to disable the user ', _self.username, ' .'].join(''), 'error');
                _self.logger.error('[error] Error occurred calling diableUser API.');
                _self.logger.error(err);
            });
    }

    enableUser() {
        const _self = this;
        _self.blockUI.start('Enabling User...');
        _self.adminService
            .enableUser(_self.username)
            .then((data: User) => {
                _self
                    .loadUserData()
                    .then(() => {
                        _self.blockUI.stop();
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', _self.username, ' .'].join(''), 'error');
                        _self.logger.error(err);
                    });
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', ['Something went wrong! Unable to enable the user ', _self.username, ' .'].join(''), 'error');
                _self.logger.error('[error] Error occurred calling enableUser API.');
                _self.logger.error(err);
            });
    }

    deleteUser() {
        const _self = this;
        _self.blockUI.start('Deleting User...');
        _self.adminService
            .deleteUser(_self.username)
            .then(() => {
                _self.blockUI.stop();
                _self.router.navigate(['/securehome/users']);
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', ['Something went wrong! Unable to delete the user ', _self.username, ' .'].join(''), 'error');
                _self.logger.error('[error] Error occurred calling diableUser API.');
                _self.logger.error(err);
            });
    }

    saveUser(user: User) {
        const _self = this;
        _self.blockUI.start('Updating User...');
        _self.adminService
            .updateUser(_self.user.user_id, _self.user.groups)
            .then((data: User) => {
                _self
                    .loadUserData()
                    .then(() => {
                        _self.blockUI.stop();
                        swal.fire('Complete.', [_self.user.name, ' record was successfully updated..'].join(''), 'success');
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal.fire('Oops...', ['Something went wrong! Unable to retrieve the user ', _self.username, ' .'].join(''), 'error');
                        _self.logger.error(err);
                    });
            })
            .catch(err => {
                _self.blockUI.stop();
                swal.fire('Oops...', ['Something went wrong! Unable to enable the user ', _self.username, ' .'].join(''), 'error');
                _self.logger.error('[error] Error occurred calling updateUser API.');
                _self.logger.error(err);
            });
    }

    cancel() {
        this.router.navigate(['/securehome/users']);
    }
}
