export class DeviceBlueprint {
    id: string;
    name = 'new';
    type = 'UNKNOWN';
    compatibility: string[] = [];
    deviceTypeMappings: any = [];
    spec: any = {};
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
