import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export class Crumb {
    title: string;
    link: string;
    active: boolean;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Injectable()
export class BreadCrumbService {
    constructor() {}

    private pageTitleSource = new Subject<any>();
    pageTitleObservable$ = this.pageTitleSource.asObservable();

    private crumbSource = new Subject<Crumb[]>();
    crumbObservable$ = this.crumbSource.asObservable();

    // pageTitle(title: string) {
    //     this.pageTitleSource.next(title);
    // }

    // crumbs(crumbs: Crumb[]) {
    //     this.crumbSource.next(crumbs);
    // }

    setup(title: string, crumbs: Crumb[]) {
        this.pageTitleSource.next(title);
        this.crumbSource.next(crumbs);
    }
}
