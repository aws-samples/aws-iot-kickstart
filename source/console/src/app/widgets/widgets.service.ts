import { Injectable, Inject } from '@angular/core';

@Injectable()
export class WidgetsService {

    public getObjectValueByString = function(obj, str) {
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
    };

    public setObjectValueByString = function(obj, str, value) {
        str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        str = str.replace(/^\./, ''); // strip a leading dot
        const ar = str.split('.');
        str = ar[0];

        for (let i = 1, n = ar.length; i < n; ++i) {
            if (str in obj) {
                obj = obj[str];
            } else {
                return;
            }

            str = ar[i];
        }

        obj[str] = value;
    };
}
