import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeploymentService {
    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {}

    public listDeployments(limit: number, nextToken: string) {
        return this.appSyncService.listDeployments(limit, nextToken);
    }

    public addDeployment(thingId: string) {
        return this.appSyncService.addDeployment(thingId);
    }
}
