export class Setting {
    id: string = '';

    type: string = '';

    setting: any = {};

    createdAt: string = '';

    updatedAt: string = '';

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
