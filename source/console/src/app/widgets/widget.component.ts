import { Component, Input, OnInit } from '@angular/core';

@Component({
    template: `
        <div *ngIf="data">{{ value }}{{ data.unit }}</div>
    `
})
export class WidgetComponent implements OnInit {
    @Input() parent: any;
    @Input() data: any;

    public value;

    ngOnInit() {
        // If our widget has a dynamic input. Check for the "input" field in the spec
        if (this.data.hasOwnProperty('input')) {
            try {
                this.data.input.forEach((input: string) => {
                    // console.log('Widget subscribes to:', input);
                    this.parent.widgetSubscriptionObservable$[input].subscribe((message: any) => {
                        const incoming = this.parseIncomingMessage(message);
                        if (incoming !== undefined) {
                            this.value = incoming;
                        }
                        // console.log(input, message, incoming);
                    });
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            this.value = this.data.value;
        }

        if (this.data.hasOwnProperty('initWithShadow') && this.data.initWithShadow === true) {
            const incoming = this.parseIncomingMessage(this.parent.shadow);
            if (incoming !== undefined) {
                this.value = incoming;
            }
        }
    }

    private parseIncomingMessage(message: any) {
        if (this.data.value.hasOwnProperty('input')) {
            return this.getValueByString(this.data.value.input, message);
        } else {
            return this.getValueByString(this.data.value, message);
        }
    }

    protected setValue(value: any) {
        if (this.data.hasOwnProperty('output') && this.data.value.hasOwnProperty('output')) {
            const payload = this.setObjectValueByString(this.data.value.output, value);
            this.parent.iotService.publish(this.data.output, payload);
        }
    }

    private getValueByString(str: string, obj: any) {
        str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        str = str.replace(/^\./, ''); // strip a leading dot
        const ar = str.split('.');
        for (let i = 0, n = ar.length; i < n; ++i) {
            const key = ar[i];
            if (key in obj) {
                obj = obj[key];
            } else {
                return;
            }
        }
        return obj;
    }

    private setObjectValueByString(str: string, value: any) {
        // Note, only support direct object: hello.world.foo and not hello.world[0].foo
        // Simple and could have bugs.

        const ar = str.split('.');
        const obj = {};

        let temp = obj;
        for (let i = 0; i < ar.length; i++) {
            if (i === ar.length - 1) {
                temp[ar[i]] = value;
            } else {
                temp[ar[i]] = {};
                temp = temp[ar[i]];
            }
        }

        return obj;

        // str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        // str = str.replace(/^\./, ''); // strip a leading dot
        // str = ar[0];
        // for (let i = 1, n = ar.length; i < n; ++i) {
        //     if (str in obj) {
        //         obj = obj[str];
        //     } else {
        //         return;
        //     }

        //     str = ar[i];
        // }
        // obj[str] = value;
    }
}
