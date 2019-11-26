import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceBlueprint } from '@models/device-blueprint.model';

// Services
import { LoggerService } from '@services/logger.service';
import {
    AppSyncService,
    AddedDeviceBlueprint,
    UpdatedDeviceBlueprint,
    DeletedDeviceBlueprint
} from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeviceBlueprintService implements AddedDeviceBlueprint, UpdatedDeviceBlueprint, DeletedDeviceBlueprint {
    private limit = 50;
    private observable: any = new Subject<any>();
    public deviceBlueprints: DeviceBlueprint[] = [];
    public deviceBlueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedDeviceBlueprint(_self);
        _self.appSyncService.onUpdatedDeviceBlueprint(_self);
        _self.appSyncService.onDeletedDeviceBlueprint(_self);

        _self.loadAll();
    }
    public add(deviceBlueprint: DeviceBlueprint) {
        return this.appSyncService.addDeviceBlueprint(deviceBlueprint).then(r => {
            this.onAddedDeviceBlueprint(r);
            return r;
        });
    }
    public update(deviceBlueprint: DeviceBlueprint) {
        return this.appSyncService.updateDeviceBlueprint(deviceBlueprint).then(r => {
            this.onUpdatedDeviceBlueprint(r);
            return r;
        });
    }
    public delete(id: string) {
        return this.appSyncService.deleteDeviceBlueprint(id).then(r => {
            this.onDeletedDeviceBlueprint(r);
            return r;
        });
    }

    private loadAll() {
        const _self = this;
        _self.listRecursive(_self.limit, null).then((results: DeviceBlueprint[]) => {
            _self.deviceBlueprints.splice(0, _self.deviceBlueprints.length);
            results.forEach(r => {
                _self.deviceBlueprints.push(r);
            });
            _self.observable.next(_self.deviceBlueprints);
        });

    }

    public refresh() {
        this.loadAll();
    }

    private listRecursive(limit: number, nextToken: string) {
        const _self = this;
        return _self.list(_self.limit, nextToken).then(result => {
            let _deviceBlueprints: DeviceBlueprint[];
            _deviceBlueprints = result.deviceBlueprints;
            if (result.nextToken) {
                return _self.listRecursive(limit, result.nextToken).then(data => {
                    data.forEach(d => {
                        _deviceBlueprints.push(d);
                    });
                    return _deviceBlueprints;
                });
            } else {
                return _deviceBlueprints;
            }
        });
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listDeviceBlueprints(limit, nextToken);
    }
    public get(id: string) {
        return this.appSyncService.getDeviceBlueprint(id);
    }

    onAddedDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        const index = _.findIndex(this.deviceBlueprints, (d: DeviceBlueprint) => {
            return d.id === deviceBlueprint.id;
        });
        if (index === -1) {
            this.deviceBlueprints.push(deviceBlueprint);
            this.observable.next(this.deviceBlueprints);
        } else {
            this.onUpdatedDeviceBlueprint(deviceBlueprint);
        }
    }
    onUpdatedDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        const index = _.findIndex(this.deviceBlueprints, (d: DeviceBlueprint) => {
            return d.id === deviceBlueprint.id;
        });
        this.deviceBlueprints[index] = deviceBlueprint;
        this.observable.next(this.deviceBlueprints);
    }
    onDeletedDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        const index = _.findIndex(this.deviceBlueprints, (d: DeviceBlueprint) => {
            return d.id === deviceBlueprint.id;
        });
        this.deviceBlueprints.splice(index, 1);
        this.observable.next(this.deviceBlueprints);
    }

}
