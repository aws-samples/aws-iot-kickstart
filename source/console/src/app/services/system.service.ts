import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { System } from '@models/system.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService, AddedSystem, UpdatedSystem, DeletedSystem } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class SystemService implements AddedSystem, UpdatedSystem, DeletedSystem {
    private limit = 10;
    private systems: System[] = [];

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedSystem(_self);
        _self.appSyncService.onUpdatedSystem(_self);
        _self.appSyncService.onDeletedSystem(_self);

        // _self.loadSystems();
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listSystems(limit, nextToken);
    }
    public get(id: string) {
        return this.appSyncService.getSystem(id);
    }
    public getSystemStats() {
        return this.appSyncService.getSystemStats();
    }
    public add(name: string, description: string, deviceIds: string[], systemBlueprintId: string) {
        return this.appSyncService.addSystem(name, description, deviceIds, systemBlueprintId).then(r => {
            this.onAddedSystem(r);
            return r;
        });
    }
    public update(id: string, name: string, description: string, deviceIds: string[]) {
        return this.appSyncService.updateSystem(id, name, description, deviceIds).then(r => {
            this.onUpdatedSystem(r);
            return r;
        });
    }
    public delete(id: string) {
        return this.appSyncService.deleteSystem(id).then(r => {
            this.onDeletedSystem(r);
            return r;
        });
    }
    public refreshSystem(id: string) {
        return this.appSyncService.refreshSystem(id);
    }

    // private pushNewSystems(systems: System[]) {
    //     const _self = this;
    //     systems.forEach((newSystem: System) => {
    //         const index = _.findIndex(_self.systems, (existingSystem: System) => {
    //             return existingSystem.id === newSystem.id;
    //         });
    //         if (index === -1) {
    //             _self.systems.push(newSystem);
    //         } else {
    //             _self.systems[index] = newSystem;
    //         }
    //     });
    // }

    // private _listSystems(limit: number, nextToken: string) {
    //     const _self = this;

    //     return _self.listSystems(limit, nextToken).then(result => {
    //         let _deviceBlueprints: System[];
    //         _deviceBlueprints = result.systems;
    //         if (result.nextToken) {
    //             return _self._listSystems(limit, result.nextToken).then(data => {
    //                 _deviceBlueprints.push(data);
    //                 return _deviceBlueprints;
    //             });
    //         } else {
    //             return _deviceBlueprints;
    //         }
    //     });
    // }

    // private loadSystems() {
    //     const _self = this;
    //     _self._listSystems(_self.limit, null).then((results: System[]) => {
    //         _self.pushNewSystems(results);
    //         _self.observable.next(results);
    //     });
    // }

    // public refresh() {
    //     this.loadSystems();
    // }

    // public getSystems() {
    //     return this.systems;
    // }

    onAddedSystem(result: System) {
        // TODO: Improve this.
    }
    onUpdatedSystem(result: System) {
        // TODO: Improve this.
    }
    onDeletedSystem(result: System) {
        // TODO: Improve this.
    }
}
