import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { DeviceStats, SystemStats } from '@models/stats.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { UserLoginService, LoggedInCallback } from '@services/user-login.service';
import { LoggerService } from '@services/logger.service';
import { StatService, Stats } from '@services/stat.service';
import { IoTService } from '@services/iot.service';
// import { AddonIoTService } from 'services/addon.iot/addon-iot.service';

// Services that cache
import { DeviceTypeService } from '@services/device-type.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';

// Helpers
declare let jquery: any;
declare let $: any;
import { _ } from 'underscore';

@Component({
    selector: 'app-root',
    templateUrl: './secure-home-layout.component.html'
})
export class SecureHomeLayoutComponent implements OnInit {
    //}, LoggedInCallback {
    // private loadedProfile = false;

    public crumbs: Crumb[] = [];
    public deviceStats: DeviceStats = new DeviceStats();
    public isAdminUser = false;
    public profile: ProfileInfo = null;
    public systemStats: SystemStats = new SystemStats();
    public title: '';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        protected localStorage: LocalStorage,
        public userService: UserLoginService,
        private statService: StatService,
        private ngZone: NgZone,
        private iotService: IoTService,
        // Here we load cached services for rest of app
        private deviceTypeService: DeviceTypeService,
        private deviceBlueprintService: DeviceBlueprintService,
        private systemBlueprintService: SystemBlueprintService
    ) {
        const self = this;
        self.isAdminUser = false;
        // self.loadedProfile = false;
        self.localStorage.setItem('deviceStats', { total: 0, connected: 0, disconnected: 0 }).subscribe(() => {});
    }

    private logError(err) {
        this.logger.error(err);
    }

    private checkLoggedIn(isLoggedIn: boolean, loadProfile: boolean, profile: ProfileInfo) {
        const self = this;
        if (!isLoggedIn) {
            self.logger.info(
                'SecureHomeCommonComponent.checkLoggedIn: Does not seem to be logged in. Navigating to Login'
            );
            self.router.navigate(['/home/login']);
        } else {
            self.logger.info(`SecureHomeCommonComponent.checkLoggedIn: Logged In.`);

            if (loadProfile) {
                self.localStorage.setItem('profile', profile).subscribe(() => {});
                self.profile = profile;
                self.isAdminUser = self.profile.isAdmin();
            }

            self.iotService.connect();
            self.iotService.connectionObservable$.subscribe((connected: boolean) => {
                self.logger.info(`Change of connection state: new state: ${connected}`);
            });

            self.statService.statObservable$.subscribe((msg: Stats) => {
                self.deviceStats = msg.deviceStats;
                self.systemStats = msg.systemStats;
                self.ngZone.run(() => {});
            });
            self.statService.refresh();
        }
    }

    ngOnInit() {
        const self = this;

        self.breadCrumbService.pageTitleObservable$.subscribe(title => (self.title = title));
        self.breadCrumbService.crumbObservable$.subscribe(crumbs => {
            self.crumbs.splice(0, self.crumbs.length);
            self.crumbs.push(...crumbs);
            self.ngZone.run(() => {});
        });

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            if (profile) {
                self.logger.info('SecureHomeComponent.ngOnInit: profile loaded, no need to request it.');
                self.profile = new ProfileInfo(profile);
                self.isAdminUser = self.profile.isAdmin();
                self.userService
                    .isAuthenticated()
                    .then(result => {
                        self.checkLoggedIn(result, false, self.profile);
                    })
                    .catch(self.logError);
            } else {
                self.logger.info('SecureHomeComponent.ngOnInit: no profile found, requesting profile');
                // self.loadedProfile = true;
                self.userService
                    .getUserInfo()
                    .then((newProfile: ProfileInfo) => {
                        self.checkLoggedIn(true, true, newProfile);
                        // self.isLoggedIn(null, true, newProfile);
                    })
                    .catch(err => {
                        self.logger.error('[Error] Error occurred retrieving user info to validate admin role.');
                        self.logger.error(err);
                    });
            }
        });

        self.prepUI();
    }

    prepUI() {
        // ==============================================================
        // This is for the top header part and sidebar part
        // ==============================================================
        const set = function() {
            const width = window.innerWidth > 0 ? window.innerWidth : this.screen.width;
            const topOffset = 70;
            if (width < 1170) {
                $('body').addClass('mini-sidebar');
                $('.navbar-brand span').hide();
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow-x', 'visible')
                    .parent()
                    .css('overflow', 'visible');
                $('.sidebartoggler i').addClass('ti-menu');
            } else {
                $('body').removeClass('mini-sidebar');
                $('.navbar-brand span').show();
            }

            let height = (window.innerHeight > 0 ? window.innerHeight : this.screen.height) - 1;
            height = height - topOffset;
            if (height < 1) {
                height = 1;
            }

            if (height > topOffset) {
                $('.page-wrapper').css('min-height', height + 'px');
            }
        };
        $(window).ready(set);
        $(window).on('resize', set);

        // ==============================================================
        // Theme options
        // ==============================================================
        $('.sidebartoggler').on('click', function() {
            if ($('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize');
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow', 'hidden')
                    .parent()
                    .css('overflow', 'visible');
                $('body').removeClass('mini-sidebar');
                $('.navbar-brand span').show();
            } else {
                $('body').trigger('resize');
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow-x', 'visible')
                    .parent()
                    .css('overflow', 'visible');
                $('body').addClass('mini-sidebar');
                $('.navbar-brand span').hide();
            }
        });

        // topbar stickey on scroll

        $('.fix-header .topbar').stick_in_parent({});

        // this is for close icon when navigation open in mobile view
        $('.nav-toggler').click(function() {
            $('body').toggleClass('show-sidebar');
            $('.nav-toggler i').toggleClass('ti-menu');
            $('.nav-toggler i').addClass('ti-close');
        });

        // ==============================================================
        // Auto select left navbar
        // ==============================================================
        $(function() {
            const url = window.location;
            let element = $('ul#sidebarnav a')
                .filter(function() {
                    return this.href === url.href;
                })
                .addClass('active')
                .parent()
                .addClass('active');
            while (true) {
                if (element.is('li')) {
                    element = element
                        .parent()
                        .addClass('in')
                        .parent()
                        .addClass('active');
                } else {
                    break;
                }
            }
        });

        // $(function() {
        //     $('#sidebarnav').metisMenu();
        // });
        this.blockUI.stop();
    }

    // isLoggedIn(message: string, isLoggedIn: boolean, profile: ProfileInfo) {
    //     const self = this;

    //     if (!isLoggedIn) {
    //         self.logger.info('SecureHomeCommonComponent.isLoggedIn:', message, isLoggedIn);
    //         self.router.navigate(['/home/login']);
    //     } else {
    //         self.logger.info('SecureHomeCommonComponent.isLoggedIn:', message, isLoggedIn, self.loadedProfile);
    //         if (self.loadedProfile) {
    //             self.localStorage.setItem('profile', profile).subscribe(() => {});
    //             self.profile = profile;
    //             self.isAdminUser = self.profile.isAdmin();
    //         }
    //         self.iotService.connect();
    //         self.iotService.connectionObservable$.subscribe((connected: boolean) => {
    //             console.log('Change of connection state: setting subscriptions', connected);
    //         });

    //         self.statService.statObservable$.subscribe((msg: Stats) => {
    //             self.deviceStats = msg.deviceStats;
    //             self.systemStats = msg.systemStats;
    //             self.ngZone.run(() => {});
    //         });
    //         self.statService.refresh();
    //     }
    // }
}
