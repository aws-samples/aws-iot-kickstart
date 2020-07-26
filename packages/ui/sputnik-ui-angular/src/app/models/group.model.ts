export class Group {
		GroupName: string;

		UserPoolId: string;

		Description: string;

		LastModifiedDate: string;

		CreationDate: string;

		constructor (values: Record<string, any> = {}) {
			Object.assign(this, values)
		}
}
