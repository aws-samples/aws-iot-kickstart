export class DeviceType {
    id: string;

    name = 'new';

    type = 'UNKNOWN';

    spec: any = {};

    createdAt: string;

    updatedAt: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
