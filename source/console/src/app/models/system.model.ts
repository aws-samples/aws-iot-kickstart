export class System {
    id: string;

    name = 'new';

    description = 'UNKNOWN';

    deviceIds: string[] = [];

    systemBlueprintId: string;

    // = 'UNKNOWN';
    createdAt: string;

    updatedAt: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
