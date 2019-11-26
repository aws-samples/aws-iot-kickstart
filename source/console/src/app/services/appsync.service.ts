import { Injectable } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { Deployment } from '@models/deployment.model';
import { Device } from '@models/device.model';
import { DeviceBlueprint } from '@models/device-blueprint.model';
import { DeviceType } from '@models/device-type.model';
import { Setting } from '@models/setting.model';
import { System } from '@models/system.model';
import { SystemBlueprint } from '@models/system-blueprint.model';
import { DeviceStats, SystemStats, SystemBlueprintStats } from '@models/stats.model';

// Queries
// import getAllDeviceTypes from '@graphql/queries/getAllDeviceTypes';
import getData from '@graphql/queries/data.get';
import getDevice from '@graphql/queries/device.get';
import getDeviceBlueprint from '@graphql/queries/device-blueprint.get';
import getDeviceStats from '@graphql/queries/device.getStats';
import getDeviceType from '@graphql/queries/device-type.get';
import getSetting from '@graphql/queries/setting.get';
import getSystem from '@graphql/queries/system.get';
import getSystemStats from '@graphql/queries/system.getStats';
import getSystemBlueprint from '@graphql/queries/system-blueprint.get';
import getJustInTimeOnBoardingState from '@graphql/queries/just-in-time-on-boarding-state.get';
import getUser from '@graphql/queries/user.get';
import listDeployments from '@graphql/queries/deployments.list';
import listDevices from '@graphql/queries/devices.list';
import listDevicesOfDeviceType from '@graphql/queries/devices-of-device-type.list';
import listDevicesWithDeviceBlueprint from '@graphql/queries/devices-with-device-blueprint.list';
import listDeviceBlueprints from '@graphql/queries/device-blueprints.list';
import listDeviceTypes from '@graphql/queries/device-types.list';
import listGroups from '@graphql/queries/groups.list';
import listSystems from '@graphql/queries/systems.list';
import listUsers from '@graphql/queries/users.list';
import listSystemBlueprints from '@graphql/queries/system-blueprints.list';
import s3ListObjectsV2 from '@graphql/queries/s3.list-objects-v2';
// Mutations
import addDeployment from '@graphql/mutations/deployment.add';
import addDevice from '@graphql/mutations/device.add';
import addDeviceBlueprint from '@graphql/mutations/device-blueprint.add';
import addDeviceType from '@graphql/mutations/device-type.add';
import addSystem from '@graphql/mutations/system.add';
import addSystemBlueprint from '@app/graphql/mutations/system-blueprint.add';
import createCertificate from '@graphql/mutations/device.create-certificate';
import deleteDevice from '@graphql/mutations/device.delete';
import deleteDeviceBlueprint from '@graphql/mutations/device-blueprint.delete';
import deleteDeviceType from '@graphql/mutations/device-type.delete';
import deleteSystem from '@graphql/mutations/system.delete';
import deleteSystemBlueprint from '@graphql/mutations/system-blueprint.delete';
import deleteUser from '@graphql/mutations/user.delete';
import disableUser from '@graphql/mutations/user.disable';
import enableUser from '@graphql/mutations/user.enable';
import inviteUser from '@graphql/mutations/user.invite';
import refreshSystem from '@graphql/mutations/system.refresh';
import setJustInTimeOnBoardingState from '@app/graphql/mutations/just-in-time-on-boarding-state.set';
import updateDevice from '@graphql/mutations/device.update';
import updateDeviceBlueprint from '@graphql/mutations/device-blueprint.update';
import updateDeviceType from '@graphql/mutations/device-type.update';
import updateSetting from '@graphql/mutations/setting.update';
import updateSystem from '@graphql/mutations/system.update';
import updateSystemBlueprint from '@graphql/mutations/system-blueprint.update';
import updateUser from '@graphql/mutations/user.update';
// Subscriptions
import addedDevice from '@graphql/subscriptions/device.added';
import addedDeviceBlueprint from '@graphql/subscriptions/device-blueprint.added';
import addedDeviceType from '@graphql/subscriptions/device-type.added';
import addedSystem from '@graphql/subscriptions/system.added';
import addedSystemBlueprint from '@graphql/subscriptions/system-blueprint.added';
import deletedDevice from '@graphql/subscriptions/device.deleted';
import deletedDeviceBlueprint from '@graphql/subscriptions/device-blueprint.deleted';
import deletedDeviceType from '@graphql/subscriptions/device-type.deleted';
import deletedSystem from '@graphql/subscriptions/system.deleted';
import deletedSystemBlueprint from '@graphql/subscriptions/system-blueprint.deleted';
import updatedDevice from '@graphql/subscriptions/device.updated';
import updatedDeviceBlueprint from '@graphql/subscriptions/device-blueprint.updated';
import updatedDeviceType from '@graphql/subscriptions/device-type.updated';
import updatedSystem from '@graphql/subscriptions/system.updated';
import updatedSystemBlueprint from '@graphql/subscriptions/system-blueprint.updated';

export interface AddedDevice {
    onAddedDevice(result: Device): void;
}
export interface UpdatedDevice {
    onUpdatedDevice(result: Device): void;
}
export interface DeletedDevice {
    onDeletedDevice(result: Device): void;
}
export interface AddedDeviceBlueprint {
    onAddedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface UpdatedDeviceBlueprint {
    onUpdatedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface DeletedDeviceBlueprint {
    onDeletedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface AddedDeviceType {
    onAddedDeviceType(result: DeviceType): void;
}
export interface UpdatedDeviceType {
    onUpdatedDeviceType(result: DeviceType): void;
}
export interface DeletedDeviceType {
    onDeletedDeviceType(result: DeviceType): void;
}
export interface AddedSystem {
    onAddedSystem(result: System): void;
}
export interface UpdatedSystem {
    onUpdatedSystem(result: System): void;
}
export interface DeletedSystem {
    onDeletedSystem(result: System): void;
}
export interface AddedSystemBlueprint {
    onAddedSystemBlueprint(result: SystemBlueprint): void;
}
export interface UpdatedSystemBlueprint {
    onUpdatedSystemBlueprint(result: SystemBlueprint): void;
}
export interface DeletedSystemBlueprint {
    onDeletedSystemBlueprint(result: SystemBlueprint): void;
}

@Injectable()
export class AppSyncService {
    constructor(private amplifyService: AmplifyService) {}

    private query(query, params) {
        const _self = this;
        const promise: any = _self.amplifyService.api().graphql({ query: query.loc.source.body, variables: params });
        return promise;
    }
    private mutation(mutation, params) {
        const _self = this;
        const promise: any = _self.amplifyService.api().graphql({ query: mutation.loc.source.body, variables: params });
        return promise;
    }
    private subscribe(subscription, params) {
        const _self = this;
        const obs: any = _self.amplifyService.api().graphql({ query: subscription.loc.source.body, variables: params });
        return obs;
    }

    // Admin
    public getData(thingName: string, metricName: string, timeAgoInSecs: number) {
        return this.query(getData, { thingName: thingName, metricName: metricName, timeAgoInSecs: timeAgoInSecs }).then(
            r => {
                return r.data.getData.Data.map(d => {
                    // d.data = JSON.parse(d.data);
                    // return d;
                    return JSON.parse(d.Data);
                });
            }
        );
    }

    // Admin
    public getUser(username: string) {
        return this.query(getUser, { username: username }).then(r => r.data.getUser);
    }

    public deleteUser(username: string) {
        return this.mutation(deleteUser, { username: username }).then(r => r.data.deleteUser);
    }
    public disableUser(username: string) {
        return this.mutation(disableUser, { username: username }).then(r => r.data.disableUser);
    }
    public enableUser(username: string) {
        return this.mutation(enableUser, { username: username }).then(r => r.data.enableUser);
    }
    public inviteUser(name: string, email: string, groups: any) {
        return this.mutation(inviteUser, {
            name: name,
            email: email,
            groups: JSON.stringify(groups)
        }).then(r => r.data.inviteUser);
    }
    public updateUser(username: string, groups: any) {
        return this.mutation(updateUser, {
            username: username,
            groups: JSON.stringify(groups)
        }).then(r => r.data.updateUser);
    }
    public listGroups(limit: number, nextToken: string) {
        return this.query(listGroups, { limit: limit, nextToken: nextToken }).then(r => r.data.listGroups);
    }
    public listUsers(limit: number, paginationToken: string) {
        return this.query(listUsers, {
            limit: limit,
            paginationToken: paginationToken
        }).then(r => r.data.listUsers);
    }

    // Device Types
    private cleanIncomingDeviceType(deviceType: DeviceType) {
        if (deviceType && deviceType.hasOwnProperty('spec') && deviceType.spec) {
            deviceType.spec = JSON.parse(deviceType.spec);
        }
        return deviceType;
    }
    private cleanOutgoingDeviceType(deviceType: DeviceType) {
        deviceType.spec = JSON.stringify(deviceType.spec);
        return deviceType;
    }
    public listDeviceTypes(limit: number, nextToken: string) {
        return this.query(listDeviceTypes, {
            limit: limit,
            nextToken: nextToken
        }).then(r => {
            r.data.listDeviceTypes.deviceTypes = r.data.listDeviceTypes.deviceTypes.map(d =>
                this.cleanIncomingDeviceType(d)
            );
            return r.data.listDeviceTypes;
        });
    }
    public getDeviceType(id: string) {
        return this.query(getDeviceType, {
            id: id
        }).then(d => this.cleanIncomingDeviceType(d.data.getDeviceType));
    }
    public addDeviceType(deviceType: DeviceType) {
        deviceType = this.cleanOutgoingDeviceType(deviceType);
        delete deviceType.id;
        delete deviceType.createdAt;
        delete deviceType.updatedAt;
        return this.mutation(addDeviceType, {
            name: deviceType.name,
            type: deviceType.type,
            spec: deviceType.spec
        }).then(d => this.cleanIncomingDeviceType(d.data.addDeviceType));
    }
    public deleteDeviceType(id: string) {
        return this.mutation(deleteDeviceType, {
            id: id
        }).then(d => this.cleanIncomingDeviceType(d.data.deleteDeviceType));
    }
    public updateDeviceType(deviceType: DeviceType) {
        deviceType = this.cleanOutgoingDeviceType(deviceType);
        delete deviceType.updatedAt;
        delete deviceType.createdAt;
        return this.mutation(updateDeviceType, deviceType).then(d =>
            this.cleanIncomingDeviceType(d.data.updateDeviceType)
        );
    }
    public onAddedDeviceType(hook: AddedDeviceType) {
        this.subscribe(addedDeviceType, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceType(this.cleanIncomingDeviceType(result.value.data.addedDeviceType));
            }
        });
    }
    public onUpdatedDeviceType(hook: UpdatedDeviceType) {
        this.subscribe(updatedDeviceType, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceType(this.cleanIncomingDeviceType(result.value.data.updatedDeviceType));
            }
        });
    }
    public onDeletedDeviceType(hook: DeletedDeviceType) {
        this.subscribe(deletedDeviceType, {}).subscribe({
            next: result => {
                return hook.onDeletedDeviceType(this.cleanIncomingDeviceType(result.value.data.deletedDeviceType));
            }
        });
    }

    // Deployments
    private cleanIncomingDeployment(deployment: Deployment) {
        if (deployment && deployment.hasOwnProperty('spec') && deployment.spec) {
            deployment.spec = JSON.parse(deployment.spec);
        }
        return deployment;
    }
    public listDeployments(limit: number, nextToken: String) {
        return this.query(listDeployments, { limit: limit, nextToken: nextToken }).then(
            result => result.data.listDeployments
        );
    }
    public addDeployment(thingId: String) {
        return this.mutation(addDeployment, { thingId: thingId }).then(result =>
            this.cleanIncomingDeployment(result.data.addDeployment)
        );
    }

    // Device Blueprints
    private cleanIncomingDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        if (deviceBlueprint && deviceBlueprint.hasOwnProperty('deviceTypeMappings') && deviceBlueprint.deviceTypeMappings) {
            deviceBlueprint.deviceTypeMappings = JSON.parse(deviceBlueprint.deviceTypeMappings);
        }
        if (deviceBlueprint && deviceBlueprint.hasOwnProperty('spec') && deviceBlueprint.spec) {
            deviceBlueprint.spec = JSON.parse(deviceBlueprint.spec);
        }
        return deviceBlueprint;
    }
    private cleanOutgoingDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint.deviceTypeMappings = JSON.stringify(deviceBlueprint.deviceTypeMappings);
        deviceBlueprint.spec = JSON.stringify(deviceBlueprint.spec);
        return deviceBlueprint;
    }
    public listDeviceBlueprints(limit: number, nextToken: string) {
        return this.query(listDeviceBlueprints, { limit: limit, nextToken: nextToken }).then(r => {
            r.data.listDeviceBlueprints.deviceBlueprints = r.data.listDeviceBlueprints.deviceBlueprints.map(d =>
                this.cleanIncomingDeviceBlueprint(d)
            );
            return r.data.listDeviceBlueprints;
        });
    }
    public getDeviceBlueprint(id: string) {
        // return this.query(getDeviceBlueprint, { id: id }).then(r => r.data.getDeviceBlueprint);
        return this.query(getDeviceBlueprint, { id: id }).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.getDeviceBlueprint);
        });
    }
    public addDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint = this.cleanOutgoingDeviceBlueprint(deviceBlueprint);
        delete deviceBlueprint.id;
        delete deviceBlueprint.updatedAt;
        delete deviceBlueprint.createdAt;
        return this.mutation(addDeviceBlueprint, deviceBlueprint).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.addDeviceBlueprint);
        });
    }
    public deleteDeviceBlueprint(id: string) {
        // return this.mutation(deleteDeviceBlueprint, { id: id }).then(r => r.data.deleteDeviceBlueprint);
        return this.mutation(deleteDeviceBlueprint, {
            id: id
        }).then(r => {
            console.log(r);
            return this.cleanIncomingDeviceBlueprint(r.data.deleteDeviceBlueprint);
        });
    }
    public updateDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint = this.cleanOutgoingDeviceBlueprint(deviceBlueprint);
        delete deviceBlueprint.updatedAt;
        delete deviceBlueprint.createdAt;
        console.log(deviceBlueprint);
        return this.mutation(updateDeviceBlueprint, deviceBlueprint).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.updateDeviceBlueprint);
        });
    }
    public onAddedDeviceBlueprint(hook: AddedDeviceBlueprint) {
        this.subscribe(addedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.addedDeviceBlueprint)
                );
            }
        });
    }
    public onUpdatedDeviceBlueprint(hook: UpdatedDeviceBlueprint) {
        this.subscribe(updatedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.updatedDeviceBlueprint)
                );
            }
        });
    }
    public onDeletedDeviceBlueprint(hook: DeletedDeviceBlueprint) {
        this.subscribe(deletedDeviceBlueprint, {}).subscribe({
            next: result => {
                console.log('onDelete', result);
                return hook.onDeletedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.deletedDeviceBlueprint)
                );
            }
        });
    }

    // Devices
    private cleanIncomingDevice(device: Device) {
        if (device && device.hasOwnProperty('spec') && device.spec) {
            device.spec = JSON.parse(device.spec);
        }
        return device;
    }
    public listDevices(limit: number, nextToken: string) {
        return this.query(listDevices, { limit: limit, nextToken: nextToken }).then(result => {
            result.data.listDevices.devices = result.data.listDevices.devices.map(r => this.cleanIncomingDevice(r));
            return result.data.listDevices;
        });
    }
    public listDevicesOfDeviceType(deviceTypeId: String, limit: number, nextToken: String) {
        return this.query(listDevicesOfDeviceType, {
            deviceTypeId: deviceTypeId,
            limit: limit,
            nextToken: nextToken
        }).then(result => {
            result.data.listDevicesOfDeviceType.devices = result.data.listDevicesOfDeviceType.devices.map(r =>
                this.cleanIncomingDevice(r)
            );
            return result.data.listDevicesOfDeviceType;
        });
    }
    public listDevicesWithDeviceBlueprint(deviceBlueprintId: String, limit: number, nextToken: String) {
        return this.query(listDevicesWithDeviceBlueprint, {
            deviceBlueprintId: deviceBlueprintId,
            limit: limit,
            nextToken: nextToken
        }).then(result => {
            result.data.listDevicesWithDeviceBlueprint.devices = result.data.listDevicesWithDeviceBlueprint.devices.map(
                r => this.cleanIncomingDevice(r)
            );
            return result.data.listDevicesWithDeviceBlueprint;
        });
    }
    public getDevice(thingId: string) {
        return this.query(getDevice, { thingId: thingId }).then(d => this.cleanIncomingDevice(d.data.getDevice));
    }
    public getDeviceStats() {
        return this.query(getDeviceStats, {}).then(result => <DeviceStats>result.data.getDeviceStats);
    }
    public addDevice(name: string, deviceTypeId: string = 'UNKNOWN', deviceBlueprintId: string = 'UNKNOWN') {
        return this.mutation(addDevice, {
            name: name,
            deviceTypeId: deviceTypeId,
            deviceBlueprintId: deviceBlueprintId
        }).then(result => this.cleanIncomingDevice(result.data.addDevice));
    }
    public deleteDevice(thingId: string) {
        return this.mutation(deleteDevice, { thingId: thingId }).then(d =>
            this.cleanIncomingDevice(d.data.deleteDevice)
        );
    }
    public updateDevice(device: Device) {
        const obj = {
            thingId: device.thingId,
            name: device.name,
            spec: JSON.stringify(device.spec),
            deviceTypeId: device.deviceTypeId,
            deviceBlueprintId: device.deviceBlueprintId
        };
        // console.log('updateDevice mutation with:', obj);
        return this.mutation(updateDevice, obj).then(d => {
            // console.log('updateDevice mutation return:', d);
            return this.cleanIncomingDevice(d.data.updateDevice);
        });
    }
    public createCertificate(thingId: string, csr: string) {
        return this.mutation(createCertificate, {
            thingId: thingId,
            csr: csr
        }).then(r => {
            return r.data.createCertificate;
        });
    }
    public onAddedDevice(hook: AddedDevice) {
        this.subscribe(addedDevice, {}).subscribe({
            next: result => {
                return hook.onAddedDevice(this.cleanIncomingDevice(result.value.data.addedDevice));
            }
        });
    }
    public onUpdatedDevice(hook: UpdatedDevice) {
        this.subscribe(updatedDevice, {}).subscribe({
            next: result => {
                return hook.onUpdatedDevice(this.cleanIncomingDevice(result.value.data.updatedDevice));
            }
        });
    }
    public onDeletedDevice(hook: DeletedDevice) {
        this.subscribe(deletedDevice, {}).subscribe({
            next: result => {
                return hook.onDeletedDevice(this.cleanIncomingDevice(result.value.data.deletedDevice));
            }
        });
    }

    // Settings
    public getSetting(id: string) {
        return this.query(getSetting, { id: id }).then(result => {
            if (result.data.getSetting !== null) {
                result.data.getSetting.setting = JSON.parse(result.data.getSetting.setting);
            }
            return <Setting>result.data.getSetting;
        });
    }
    public updateSetting(setting: Setting) {
        return this.query(updateSetting, {
            id: setting.id,
            type: setting.type,
            setting: JSON.stringify(setting.setting)
        }).then(result => {
            if (result.data.updateSetting !== null) {
                result.data.updateSetting.setting = JSON.parse(result.data.updateSetting.setting);
            }
            return <Setting>result.data.updateSetting;
        });
    }
    public getJustInTimeOnBoardingState() {
        return this.query(getJustInTimeOnBoardingState, {}).then(result => {
            return result.data.getJustInTimeOnBoardingState;
        });
    }
    public setJustInTimeOnBoardingState(enabled: boolean) {
        return this.query(setJustInTimeOnBoardingState, { enabled: enabled }).then(result => {
            return result.data.setJustInTimeOnBoardingState;
        });
    }

    // Systems
    public listSystems(limit: number, nextToken: string) {
        return this.query(listSystems, { limit: limit, nextToken: nextToken }).then(result => {
            return result.data.listSystems;
        });
    }
    public getSystem(id: string) {
        return this.query(getSystem, { id: id }).then(d => <System>d.data.getSystem);
    }
    public getSystemStats() {
        return this.query(getSystemStats, {}).then(result => <SystemStats>result.data.getSystemStats);
    }
    public addSystem(name: string, description: string, deviceIds: string[], systemBlueprintId: string) {
        return this.mutation(addSystem, {
            name: name,
            description: description,
            deviceIds: deviceIds,
            systemBlueprintId: systemBlueprintId
        }).then(result => {
            return <System>result.data.system;
        });
    }
    public deleteSystem(id: string) {
        return this.mutation(deleteSystem, { id: id }).then(d => {
            return <System>d.data.deleteSystem;
        });
    }
    public updateSystem(id: string, name: string, description: string, deviceIds: string[]) {
        return this.mutation(updateSystem, {
            id: id,
            name: name,
            description: description,
            deviceIds: deviceIds
        }).then(d => {
            return <System>d.data.updateSystem;
        });
    }
    public refreshSystem(id: string) {
        return this.mutation(refreshSystem, {
            id: id
        }).then(r => r.data.refreshSystem);
    }
    public onAddedSystem(hook: AddedSystem) {
        this.subscribe(addedSystem, {}).subscribe({
            next: result => {
                return hook.onAddedSystem(result.value.data.addedSystem);
            }
        });
    }
    public onUpdatedSystem(hook: UpdatedSystem) {
        this.subscribe(updatedSystem, {}).subscribe({
            next: result => {
                return hook.onUpdatedSystem(result.value.data.updatedSystem);
            }
        });
    }
    public onDeletedSystem(hook: DeletedSystem) {
        this.subscribe(deletedSystem, {}).subscribe({
            next: result => {
                return hook.onDeletedSystem(result.value.data.deletedSystem);
            }
        });
    }

    // System Blueprints
    private cleanIncomingSystemBlueprint(systemBlueprint: SystemBlueprint) {
        if (systemBlueprint && systemBlueprint.hasOwnProperty('spec') && systemBlueprint.spec) {
            systemBlueprint.spec = JSON.parse(systemBlueprint.spec);
        }
        return systemBlueprint;
    }
    private cleanOutgoingSystemBlueprint(systemBlueprint: SystemBlueprint) {
        systemBlueprint.spec = JSON.stringify(systemBlueprint.spec);
        return systemBlueprint;
    }
    public listSystemBlueprints(limit: number, nextToken: string) {
        return this.query(listSystemBlueprints, { limit: limit, nextToken: nextToken }).then(result => {
            result.data.listSystemBlueprints.systemBlueprints = result.data.listSystemBlueprints.systemBlueprints.map(
                r => this.cleanIncomingSystemBlueprint(r)
            );
            return result.data.listSystemBlueprints;
        });
    }
    public getSystemBlueprint(id: string) {
        return this.query(getSystemBlueprint, {
            id: id
        }).then(d => this.cleanIncomingSystemBlueprint(d.data.getSystemBlueprint));
    }
    public addSystemBlueprint(systemBlueprint: SystemBlueprint) {
        systemBlueprint = this.cleanOutgoingSystemBlueprint(systemBlueprint);
        delete systemBlueprint.id;
        delete systemBlueprint.createdAt;
        delete systemBlueprint.updatedAt;
        return this.mutation(addSystemBlueprint, {
            name: systemBlueprint.name,
            description: systemBlueprint.description,
            spec: systemBlueprint.spec
        }).then(r => this.cleanIncomingSystemBlueprint(r.data.addSystemBlueprint));
    }
    public deleteSystemBlueprint(id: string) {
        return this.mutation(deleteSystemBlueprint, {
            id: id
        }).then(r => this.cleanIncomingSystemBlueprint(r.data.deleteSystemBlueprint));
    }
    public updateSystemBlueprint(systemBlueprint: SystemBlueprint) {
        systemBlueprint = this.cleanOutgoingSystemBlueprint(systemBlueprint);
        delete systemBlueprint.updatedAt;
        delete systemBlueprint.createdAt;
        return this.mutation(updateSystemBlueprint, systemBlueprint).then(r =>
            this.cleanIncomingSystemBlueprint(r.data.updateSystemBlueprint)
        );
    }
    public onAddedSystemBlueprint(hook: AddedSystemBlueprint) {
        this.subscribe(addedSystemBlueprint, {}).subscribe({
            next: result => {
                return hook.onAddedSystemBlueprint(
                    this.cleanIncomingSystemBlueprint(result.value.data.addedSystemBlueprint)
                );
            }
        });
    }
    public onUpdatedSystemBlueprint(hook: UpdatedSystemBlueprint) {
        this.subscribe(updatedSystemBlueprint, {}).subscribe({
            next: result => {
                return hook.onUpdatedSystemBlueprint(
                    this.cleanIncomingSystemBlueprint(result.value.data.updatedSystemBlueprint)
                );
            }
        });
    }
    public onDeletedSystemBlueprint(hook: DeletedSystemBlueprint) {
        this.subscribe(deletedSystemBlueprint, {}).subscribe({
            next: result => {
                return hook.onDeletedSystemBlueprint(
                    this.cleanIncomingSystemBlueprint(result.value.data.deletedSystemBlueprint)
                );
            }
        });
    }

    // Utils
    public s3ListObjectsV2(params) {
        return this.query(s3ListObjectsV2, {
            params: JSON.stringify(params)
        }).then(r => r.data.s3ListObjectsV2);
    }
}
