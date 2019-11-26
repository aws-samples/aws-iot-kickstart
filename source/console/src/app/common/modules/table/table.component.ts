import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { LoggerService } from '@services/logger.service';

export class TableHeader {
    attr: string;
    name: string;
    class: string;
    pipe: string;
    pipeValue: string;
}

export class Pages {
    current: Number;
    total: Number;
    pageSize: Number;
}

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html'
})
export class TableComponent implements OnInit {
    @Input()
    dataPagingLimit: Number = 10;
    @Input()
    data: any;
    @Input()
    tableData: any[];
    @Input()
    tableHeaders: TableHeader[];
    @Input()
    pages: Pages;
    @Input()
    openAttribute: string;
    @Input()
    openPath: string;

    constructor(private logger: LoggerService, private router: Router) {
        this.logger.info('constructor');
        this.data = [];
        this.tableData = [];
        this.tableHeaders = [];
        this.pages = null;
        this.openAttribute = null;
        this.openPath = null;
    }

    ngOnInit() {
        this.logger.info('onInit');
    }

    click(elem) {
        if (this.openAttribute !== null && this.openPath !== null) {
            this.router.navigate([this.openPath + elem[this.openAttribute]]);
        }
    }
}
