import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'certIdFromArn', pure: true })
export class CertIdFromArnPipe implements PipeTransform {

    constructor() {}

    transform(arn: string): string {
        if (arn === undefined || arn === 'NOTSET') {
            return 'Certificate Not Defined!';
        } else {
            return arn.split('cert/')[1];
        }
    }
}
