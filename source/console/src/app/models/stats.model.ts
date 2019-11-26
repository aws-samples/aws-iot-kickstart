export class DeviceStats {
    total = 0;
    connected = 0;
    disconnected = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SystemStats {
    total = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SystemBlueprintStats {
    total = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
