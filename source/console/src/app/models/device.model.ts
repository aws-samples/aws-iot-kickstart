export class ConnectionState {
    state: string;

    at: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}

export class Device {
    thingId: string;

    thingName: string;

    thingArn: string;

    name: string;

    namespace: string;

    deviceTypeId: string;

    deviceBlueprintId: string;

    greengrassGroupId: string;

    metadata: any;

    spec: any = {};

    connectionState: ConnectionState = new ConnectionState();

    lastDeploymentId: string;

    createdAt: string;

    updatedAt: string;

    certificateArn: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
