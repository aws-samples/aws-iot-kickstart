export class SystemBlueprint {
    id: string;
    name = 'new';
    description = 'UNKNOWN';
    prefix = 'Sputnik_';
    spec: any = {};
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
