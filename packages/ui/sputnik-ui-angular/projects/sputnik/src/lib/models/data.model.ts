
export class Data {
		thingNameAndMetric: string;

		timestamp: number;

		data: any;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}
