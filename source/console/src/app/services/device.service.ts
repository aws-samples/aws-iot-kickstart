import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Device } from '@models/device.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService, AddedDevice, UpdatedDevice, DeletedDevice } from './appsync.service';

// Helpers
import { _ } from 'underscore';
import * as forge from 'node-forge';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
declare var appVariables: any;

@Injectable()
export class DeviceService implements AddedDevice, UpdatedDevice, DeletedDevice {
    private limit = 10;
    private observable: any = new Subject<any>();
    public devices: Device[] = [];
    devicesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedDevice(_self);
        _self.appSyncService.onUpdatedDevice(_self);
        _self.appSyncService.onDeletedDevice(_self);
    }

    public listDevices(limit: number, nextToken: string) {
        return this.appSyncService.listDevices(limit, nextToken);
    }
    public listDevicesOfDeviceType(deviceTypeId: string, limit: number, nextToken: string) {
        return this.appSyncService.listDevicesOfDeviceType(deviceTypeId, limit, nextToken);
    }
    public listDevicesWithDeviceBlueprint(deviceBlueprintId: string, limit: number, nextToken: string) {
        return this.appSyncService.listDevicesWithDeviceBlueprint(deviceBlueprintId, limit, nextToken);
    }

    public listRecursive(listFunction: string, id: string, limit: number, nextToken: string) {
        const _self = this;

        return _self[listFunction](id, _self.limit, nextToken).then(result => {
            let _devices: Device[];
            _devices = result.devices;
            if (result.nextToken) {
                return _self.listRecursive(listFunction, id, limit, result.nextToken).then(data => {
                    data.forEach(d => {
                        _devices.push(d);
                    });
                    return _devices;
                });
            } else {
                return _devices;
            }
        });
    }

    public getDevice(thingId: string) {
        return this.appSyncService.getDevice(thingId);
    }
    public updateDevice(device: Device) {
        return this.appSyncService.updateDevice(device).then(r => {
            this.onUpdatedDevice(r);
            return r;
        });
    }
    public deleteDevice(thingId: string) {
        return this.appSyncService.deleteDevice(thingId).then(r => {
            this.onDeletedDevice(r);
            return r;
        });
    }
    public addDevice(name: string, deviceTypeId: string = 'UNKNOWN', deviceBlueprintId: string = 'UNKNOWN') {
        return this.appSyncService.addDevice(name, deviceTypeId, deviceBlueprintId).then(r => {
            this.onAddedDevice(r);
            return r;
        });
    }
    public createZip(
        certs: {
            thingName: string;
            cert: {
                certificateId: string;
                certificateArn: string;
                certificatePem: string;
                privateKey: string;
                publicKey: string;
            };
        }[]
    ) {
        if (certs.length >= 1) {
            const zip = new JSZip();

            certs.forEach(c => {
                const cert = c.cert;
                const thingName = c.thingName;
                const shortCertName = cert.certificateId.substring(0, 11);
                const thingArnArray = cert.certificateArn.split('cert');
                thingArnArray.splice(thingArnArray.length - 1, 1, '/' + thingName);
                const thingArn = thingArnArray.join('thing');

                zip.folder(thingName).file(shortCertName + '-cert.crt', cert.certificatePem);
                zip.folder(thingName).file(shortCertName + '-private.key', cert.privateKey);
                zip.folder(thingName).file(shortCertName + '-public.key', cert.publicKey);
                zip.folder(thingName).file(
                    'config.json',
                    JSON.stringify({
                        coreThing: {
                            caPath: 'root.ca.pem',
                            certPath: shortCertName + '-cert.crt',
                            keyPath: shortCertName + '-private.key',
                            thingArn: thingArn,
                            iotHost: appVariables.IOT_ENDPOINT,
                            ggHost: 'greengrass-ats.iot.us-east-1.amazonaws.com',
                            keepAlive: 600
                        },
                        runtime: {
                            cgroup: {
                                useSystemd: 'yes'
                            }
                        },
                        managedRespawn: false,
                        crypto: {
                            principals: {
                                SecretsManager: {
                                    privateKeyPath: 'file:///greengrass/certs/' + shortCertName + '-private.key'
                                },
                                IoTCertificate: {
                                    privateKeyPath: 'file:///greengrass/certs/' + shortCertName + '-private.key',
                                    certificatePath: 'file:///greengrass/certs/' + shortCertName + '-cert.crt'
                                }
                            },
                            caPath: 'file:///greengrass/certs/root.ca.pem'
                        }
                    })
                );
            });

            zip.generateAsync({
                type: 'blob'
            }).then(
                (blob: any) => {
                    // 1) generate the zip file
                    saveAs(blob, (certs.length === 1 ? certs[0].thingName : 'certs') + '.zip');
                },
                (error: any) => {
                    console.error(error);
                }
            );
        }
    }
    public createCertificate(device: Device, deviceBlueprintId: string = null, deviceTypeId: string = null) {
        return new Promise((resolve, reject) => {
            forge.pki.rsa.generateKeyPair(
                {
                    bits: 4096,
                    workers: 2
                },
                (err, keypair) => {
                    if (err) {
                        console.error('createCertificate: error', err);
                        return reject(err);
                    } else {
                        const csr = forge.pki.createCertificationRequest();
                        csr.publicKey = keypair.publicKey;
                        csr.setSubject([
                            {
                                name: 'organizationName',
                                value: 'sputnik'
                            },
                            {
                                name: 'commonName',
                                value: device.thingName
                            }
                        ]);

                        csr.sign(keypair.privateKey);

                        const verified = csr.verify();
                        const pem = forge.pki.certificationRequestToPem(csr);

                        this.appSyncService
                            .createCertificate(device.thingId, pem)
                            .then(cert => {
                                cert.privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
                                cert.publicKey = forge.pki.publicKeyToPem(keypair.publicKey);

                                resolve({
                                    thingName: device.thingName,
                                    cert: {
                                        certificateId: cert.certificateId,
                                        certificateArn: cert.certificateArn,
                                        certificatePem: cert.certificatePem,
                                        privateKey: cert.privateKey,
                                        publicKey: cert.publicKey
                                    }
                                });
                            })
                            .catch(error => {
                                reject(error);
                            });
                    }
                }
            );
        });
    }

    onAddedDevice(device: Device) {
        // TODO: Improve this.
        this.observable.next(device);
    }
    onUpdatedDevice(result: Device) {
        // TODO: Improve this.
    }
    onDeletedDevice(result: Device) {
        // TODO: Improve this.
    }
}
