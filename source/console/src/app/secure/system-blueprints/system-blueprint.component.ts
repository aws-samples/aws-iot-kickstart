import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { SystemBlueprint } from '@models/system-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-system-blueprint',
    templateUrl: './system-blueprint.component.html'
})
export class SystemBlueprintComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'Device Type';
    public systemBlueprintId: string;
    public systemBlueprint: SystemBlueprint;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private systemBlueprintService: SystemBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone
    ) {
        this.systemBlueprintId = '';
        this.systemBlueprint = undefined;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.route.params.subscribe(params => {
                self.systemBlueprintId = params['id'];

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'system-blueprints'
                    }),
                    new Crumb({
                        title: self.systemBlueprintId,
                        active: true
                    })
                ]);

                self.loadSystemBlueprint(self.systemBlueprintId);

                self.blockUI.stop();
            });
        });
    }

    private loadSystemBlueprint(systemBlueprintId) {
        const self = this;
        self.systemBlueprintService.systemBlueprintsObservable$.subscribe(message => {
            self.ngZone.run(() => {
                if (self.systemBlueprintId !== 'new') {
                    self.systemBlueprint = self.systemBlueprintService.systemBlueprints.find(systemBlueprint => {
                        return systemBlueprint.id === self.systemBlueprintId;
                    });
                }
            });
        });

        if (self.systemBlueprintId !== 'new') {
            self.systemBlueprint = self.systemBlueprintService.systemBlueprints.find(systemBlueprint => {
                return systemBlueprint.id === self.systemBlueprintId;
            });
        } else {
            self.systemBlueprint = new SystemBlueprint();
        }
    }

    cancel() {
        this.router.navigate(['/securehome/system-blueprints']);
    }

    submit(f) {
        console.log(f);
        if (this.systemBlueprintId === 'new') {
            this.systemBlueprintService
                .add(this.systemBlueprint)
                .then(systemBlueprint => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Created systemBlueprint:', systemBlueprint);
                        this.router.navigate(['securehome/system-blueprints/' + systemBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to create systemBlueprint', 'error');
                    this.logger.error('Error creating systemBlueprint:', err);
                });
        } else {
            this.systemBlueprintService
                .update(this.systemBlueprint)
                .then(systemBlueprint => {
                    swal.fire({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Updated systemBlueprint:', systemBlueprint);
                        this.router.navigate(['securehome/system-blueprints/' + systemBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal.fire('Oops...', 'Something went wrong! In trying to update systemBlueprint', 'error');
                    this.logger.error('Error creating systemBlueprint:', err);
                });
        }
    }

    delete() {
        swal.fire({
            title: 'Are you sure you want to delete this system blueprint?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deleting system blueprint...');
                this.systemBlueprintService
                    .delete(this.systemBlueprint.id)
                    .then((resp: any) => {
                        this.blockUI.stop();
                        this.router.navigate(['securehome/system-blueprints']);
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal.fire('Oops...', 'Something went wrong! Unable to delete the system blueprint.', 'error');
                        this.logger.error('error occurred calling deleteSystemBlueprint api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }
}
