export class Message {
    topic: string;

    content: any = {};

    timestamp: string;

    constructor (values: Record<string, any> = {}) {
    	Object.assign(this, values)
    }
}
