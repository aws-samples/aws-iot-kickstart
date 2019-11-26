import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceType } from '@models/device-type.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService, AddedDeviceType, UpdatedDeviceType, DeletedDeviceType } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeviceTypeService implements AddedDeviceType, UpdatedDeviceType, DeletedDeviceType {
    private limit = 50; // TODO: increase this.
    public deviceTypes: DeviceType[] = [];
    private observable: any = new Subject<any>();
    public deviceTypesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedDeviceType(_self);
        _self.appSyncService.onUpdatedDeviceType(_self);
        _self.appSyncService.onDeletedDeviceType(_self);

        _self.loadAll();
    }
    public add(deviceType: DeviceType) {
        return this.appSyncService.addDeviceType(deviceType).then(r => {
            this.onAddedDeviceType(r);
            return r;
        });
    }
    public update(deviceType: DeviceType) {
        return this.appSyncService.updateDeviceType(deviceType).then(r => {
            this.onUpdatedDeviceType(r);
            return r;
        });
    }
    public delete(id: string) {
        return this.appSyncService.deleteDeviceType(id).then(r => {
            this.onDeletedDeviceType(r);
            return r;
        });
    }

    private loadAll() {
        const _self = this;
        _self.listRecursive(_self.limit, null).then((results: DeviceType[]) => {
            _self.deviceTypes.splice(0, _self.deviceTypes.length);
            results.forEach(r => {
                _self.deviceTypes.push(r);
            });
            _self.observable.next(_self.deviceTypes);
        });
    }

    public refresh() {
        this.loadAll();
    }

    private listRecursive(limit: number, nextToken: string) {
        const _self = this;
        return _self.list(_self.limit, nextToken).then(result => {
            let _deviceTypes: DeviceType[];
            _deviceTypes = result.deviceTypes;
            if (result.nextToken) {
                return _self.listRecursive(limit, result.nextToken).then(data => {
                    data.forEach(d => {
                        _deviceTypes.push(d);
                    });
                    return _deviceTypes;
                });
            } else {
                return _deviceTypes;
            }
        });
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listDeviceTypes(limit, nextToken);
    }

    public get(id: string) {
        return this.appSyncService.getDeviceType(id);
        // console.log('deviceTypeService.getDeviceType');
        // return this.deviceTypes.find((dt: DeviceType) => {
        //     return dt.id === id;
        // });
    }

    onAddedDeviceType(deviceType: DeviceType) {
        const _self = this;
        const index = _.findIndex(_self.deviceTypes, (d: DeviceType) => {
            return d.id === deviceType.id;
        });
        if (index === -1) {
            _self.deviceTypes.push(deviceType);
            _self.observable.next(_self.deviceTypes);
        } else {
            _self.onUpdatedDeviceType(deviceType);
        }
    }
    onUpdatedDeviceType(deviceType: DeviceType) {
        const _self = this;
        const index = _.findIndex(_self.deviceTypes, (d: DeviceType) => {
            return d.id === deviceType.id;
        });
        _self.deviceTypes[index] = deviceType;
        _self.observable.next(_self.deviceTypes);
    }
    onDeletedDeviceType(deviceType: DeviceType) {
        const _self = this;
        const index = _.findIndex(_self.deviceTypes, (d: DeviceType) => {
            return d.id === deviceType.id;
        });
        _self.deviceTypes.splice(index, 1);
        _self.observable.next(_self.deviceTypes);
    }
}
