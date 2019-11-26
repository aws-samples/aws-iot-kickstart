
export class Data {
    thingNameAndMetric: string;
    timestamp: number;
    data: any;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
