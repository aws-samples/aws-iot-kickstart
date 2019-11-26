export class User {
    user_id: string;
    name: string;
    email: string;
    enabled: string;
    groups: any[];
    status: string;
    created_at: string;
    updated_at: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

}
