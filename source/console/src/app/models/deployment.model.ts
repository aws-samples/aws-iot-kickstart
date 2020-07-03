export class Deployment {
    thingId: string;

    deploymentId: string;

    spec = '{}';

    createdAt: string;

    updatedAt: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
