import { Component } from '@angular/core';

@Component({
    selector: 'app-root-prettifier',
    template: ''
})
export class PrettifierComponent {
    public prettifying = '';

    private keyUpTimeOut1: any = null;
    private keyUpTimeOut2: any = null;

    constructor() {}

    editJsonOnKey(event: any, width: number, obj: any, attribute: string) {
        const _self = this;
        _self.prettifying = '';
        clearTimeout(_self.keyUpTimeOut1);
        clearTimeout(_self.keyUpTimeOut2);
        _self.keyUpTimeOut1 = setTimeout(function() {
            _self.prettifying = '(formating json...)';
            _self.keyUpTimeOut1 = setTimeout(function() {
                try {
                    obj[attribute] = JSON.stringify(JSON.parse(event.target.value), null, width);
                    event.target.value = obj[attribute];
                    _self.prettifying = '';
                } catch (ex) {
                    _self.prettifying = '(ERROR: JSON is incorrect!)';
                }
            }, 100);
        }, 500);
    }

    manualPrettify(obj: any, attribute: string, width: number) {
        // obj[attribute] = JSON.stringify(JSON.parse(obj[attribute]), null, width);
        obj[attribute] = JSON.stringify(obj[attribute], null, width);
    }
}

