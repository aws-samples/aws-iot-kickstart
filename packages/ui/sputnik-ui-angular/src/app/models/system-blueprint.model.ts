export class SystemBlueprint {
		id: string;

		name = 'new';

		description = 'UNKNOWN';

		prefix = 'Sputnik_';

		spec: any = {};

		createdAt: string;

		updatedAt: string;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}
