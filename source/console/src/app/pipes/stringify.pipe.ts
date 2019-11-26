import { Pipe, PipeTransform } from '@angular/core';
// @Pipe({ name: 'stringify' })
@Pipe({ name: 'stringify', pure: true })
// @Pipe({ name: 'stringify', pure: false })
export class StringifyPipe implements PipeTransform {
    transform(value: any, width: number): any {
        return JSON.stringify(value, null, width);
    }
}
