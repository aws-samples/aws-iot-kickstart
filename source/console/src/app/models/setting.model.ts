export class Setting {
    id: string = '';
    type: string = '';
    setting: any = {};
    createdAt: string = '';
    updatedAt: string = '';

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

}
