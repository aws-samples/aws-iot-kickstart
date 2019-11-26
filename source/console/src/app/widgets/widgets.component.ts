import {
    Component,
    Input,
    OnInit,
    AfterViewInit,
    ComponentFactoryResolver,
    ViewChildren,
    QueryList,
    ViewContainerRef
} from '@angular/core';

// Components
import { ButtonWidgetComponent } from './button-widget.component';
import { CardWidgetComponent } from './card-widget.component';
import { CheckboxWidgetComponent } from './checkbox-widget.component';
import { InputTextWidgetComponent } from './input-text-widget.component';
import { TextWidgetComponent } from './text-widget.component';
import { GraphRealtimeWidgetComponent } from './graph-realtime-widget.component';
import { ColorPickerWidgetComponent } from './color-picker-widget.component';

const widgetComponentTypes = {
    'button': ButtonWidgetComponent,
    'card': CardWidgetComponent,
    'checkbox': CheckboxWidgetComponent,
    'color-picker': ColorPickerWidgetComponent,
    'graph-realtime': GraphRealtimeWidgetComponent,
    'input-text': InputTextWidgetComponent,
    'text': TextWidgetComponent
};

@Component({
    selector: 'app-widgets',
    template: `
        <!-- Row -->
        <div class="row">
            <div *ngFor="let widget of widgets" [ngClass]="widget.class">
                <ng-container #container></ng-container>
            </div>
        </div>
        <!-- Row -->
    `
})
export class WidgetsComponent implements OnInit, AfterViewInit {
    @Input() widgets: any[];
    @Input() parent: any;
    @ViewChildren('container', { read: ViewContainerRef }) private widgetContainers: QueryList<ViewContainerRef>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {
        // this.parent.getValueByString = function(str) {
        //     let obj = this;
        //     str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        //     str = str.replace(/^\./, ''); // strip a leading dot
        //     const ar = str.split('.');
        //     for (let i = 0, n = ar.length; i < n; ++i) {
        //         const key = ar[i];
        //         if (key in obj) {
        //             obj = obj[key];
        //         } else {
        //             return;
        //         }
        //     }
        //     return obj;
        // };
        // this.parent.setValueByString = function(str, value) {
        //     let obj = this;
        //     str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        //     str = str.replace(/^\./, ''); // strip a leading dot
        //     const ar = str.split('.');
        //     str = ar[0];
        //     for (let i = 1, n = ar.length; i < n; ++i) {
        //         if (str in obj) {
        //             obj = obj[str];
        //         } else {
        //             return;
        //         }
        //         str = ar[i];
        //     }
        //     obj[str] = value;
        // };
    }
    ngAfterViewInit() {
        this.loadComponents();
    }

    private getComponentForWidgetType(widgetType) {
        return widgetComponentTypes[widgetType];
    }

    loadComponents() {
        // console.log('loadComponents: Loading', this.widgetContainers.length, 'components');
        this.widgetContainers.forEach((widgetContainer: ViewContainerRef, index) => {
            const viewComponent = this.getComponentForWidgetType(this.widgets[index].type);
            // console.log('loadComponents:', this.widgets[index].type);
            if (viewComponent) {
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewComponent);
                const viewContainerRef = widgetContainer;
                viewContainerRef.clear();
                const componentRef = viewContainerRef.createComponent(componentFactory);
                (<typeof viewComponent>componentRef.instance).parent = this.parent;
                (<typeof viewComponent>componentRef.instance).data = this.widgets[index].data || {};
                componentRef.changeDetectorRef.detectChanges();
            }
        });
    }
}
