
export class AddOn {
		id: string;

		name: string;

		img: string;

		version: string;

		description: string;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}
