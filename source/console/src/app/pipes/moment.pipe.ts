import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
    transform(value: any, format: string): any {
        return moment(value).format(format);
    }
}

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
    transform(value: any): any {
        return moment(value).fromNow();
    }
}

@Pipe({ name: 'fromNowValue' })
export class FromNowValuePipe implements PipeTransform {
    transform(value: any): any {
        return moment().diff(moment(value), 'seconds');
    }
}

@Pipe({ name: 'momentTo' })
export class MomentToPipe implements PipeTransform {
    transform(value: any, offsetSeconds: number = 0): any {
        return moment().to(moment(value).add(offsetSeconds, 'seconds'));
    }
}
