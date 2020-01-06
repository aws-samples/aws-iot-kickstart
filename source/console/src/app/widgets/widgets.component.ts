import {
    Component,
    Input,
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
import { ColorPickerWidgetComponent } from './color-picker-widget.component';
import { GaugeWidgetComponent } from './gauge-widget.component';
import { GraphRealtimeWidgetComponent } from './graph-realtime-widget.component';
import { InputTextWidgetComponent } from './input-text-widget.component';
import { TextWidgetComponent } from './text-widget.component';

const widgetComponentTypes = {
    'button': ButtonWidgetComponent,
    'card': CardWidgetComponent,
    'checkbox': CheckboxWidgetComponent,
    'color-picker': ColorPickerWidgetComponent,
    'gauge': GaugeWidgetComponent,
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
export class WidgetsComponent implements AfterViewInit {
    @Input() widgets: any[];
    @Input() parent: any;
    @ViewChildren('container', { read: ViewContainerRef }) private widgetContainers: QueryList<ViewContainerRef>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

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
