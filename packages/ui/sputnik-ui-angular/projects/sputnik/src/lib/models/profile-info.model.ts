// declare let _: any;
import { contains } from 'underscore'

export class ProfileInfo {
		user_id: string;

		name: string;

		email: string;

		enabled: boolean;

		groups: any[];

		mapboxToken: string;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}

		isAdmin (): boolean {
			return contains(this.groups, 'Administrators')
		}
}
