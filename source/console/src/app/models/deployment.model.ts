export class Deployment {
    thingId: string;
    deploymentId: string;
    spec = '{}';
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
