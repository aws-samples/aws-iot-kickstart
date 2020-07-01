export class DeviceBlueprint {
    id: string;

    name = 'new';

    type = 'UNKNOWN';

    compatibility: string[] = [];

    deviceTypeMappings: any = [];

    spec: any = {};

    createdAt: string;

    updatedAt: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
