import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { SystemBlueprint } from '@models/system-blueprint.model';

// Services
import { LoggerService } from './logger.service';
import {
    AppSyncService,
    AddedSystemBlueprint,
    UpdatedSystemBlueprint,
    DeletedSystemBlueprint
} from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class SystemBlueprintService
    implements AddedSystemBlueprint, UpdatedSystemBlueprint, DeletedSystemBlueprint {
    private limit = 50;
    public systemBlueprints: SystemBlueprint[] = [];
    private observable: Subject<any> = new Subject<any>();
    public systemBlueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedSystemBlueprint(_self);
        _self.appSyncService.onUpdatedSystemBlueprint(_self);
        _self.appSyncService.onDeletedSystemBlueprint(_self);

        _self.loadAll();
    }
    public add(systemBlueprint: SystemBlueprint) {
        return this.appSyncService.addSystemBlueprint(systemBlueprint).then(r => {
            this.onAddedSystemBlueprint(r);
            return r;
        });
    }
    public update(systemBlueprint: SystemBlueprint) {
        return this.appSyncService.updateSystemBlueprint(systemBlueprint).then(r => {
            this.onUpdatedSystemBlueprint(r);
            return r;
        });
    }
    public delete(id: string) {
        return this.appSyncService.deleteSystemBlueprint(id).then(r => {
            this.onDeletedSystemBlueprint(r);
            return r;
        });
    }

    private loadAll() {
        const _self = this;
        _self.listRecursive(_self.limit, null).then((results: SystemBlueprint[]) => {
            _self.systemBlueprints.splice(0, _self.systemBlueprints.length);
            results.forEach(r => {
                _self.systemBlueprints.push(r);
            });
            _self.observable.next(_self.systemBlueprints);
        });
    }

    public refresh() {
        this.loadAll();
    }

    private listRecursive(limit: number, nextToken: string) {
        const _self = this;
        return _self.list(_self.limit, nextToken).then(result => {
            let _systemBlueprints: SystemBlueprint[];
            _systemBlueprints = result.systemBlueprints;
            if (result.nextToken) {
                return _self.listRecursive(limit, result.nextToken).then(data => {
                    data.forEach(d => {
                        _systemBlueprints.push(d);
                    });
                    return _systemBlueprints;
                });
            } else {
                return _systemBlueprints;
            }
        });
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listSystemBlueprints(limit, nextToken);
    }
    public get(id: string) {
        return this.appSyncService.getSystemBlueprint(id);
    }

    onAddedSystemBlueprint(result: SystemBlueprint) {
        const index = _.findIndex(this.systemBlueprints, (r: SystemBlueprint) => {
            return r.id === result.id;
        });
        if (index === -1) {
            this.systemBlueprints.push(result);
            this.observable.next(this.systemBlueprints);
        } else {
            this.onUpdatedSystemBlueprint(result);
        }
    }
    onUpdatedSystemBlueprint(result: SystemBlueprint) {
        const index = _.findIndex(this.systemBlueprints, (r: SystemBlueprint) => {
            return r.id === result.id;
        });
        this.systemBlueprints[index] = result;
        this.observable.next(this.systemBlueprints);
    }
    onDeletedSystemBlueprint(result: SystemBlueprint) {
        const index = _.findIndex(this.systemBlueprints, (r: SystemBlueprint) => {
            return r.id === result.id;
        });
        this.systemBlueprints.splice(index, 1);
        this.observable.next(this.systemBlueprints);
    }
}
