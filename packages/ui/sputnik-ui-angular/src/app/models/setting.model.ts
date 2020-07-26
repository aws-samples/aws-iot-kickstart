export class Setting {
		id = '';

		type = '';

		setting: any = {};

		createdAt = '';

		updatedAt = '';

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}
