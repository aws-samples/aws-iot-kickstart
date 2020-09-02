import {
    Component,
    Input,
    AfterViewInit,
    ComponentFactoryResolver,
    ViewChildren,
    QueryList,
    ViewContainerRef,
} from '@angular/core';

// Components
import { ButtonWidgetComponent } from './button-widget.component';
import { CardWidgetComponent } from './card-widget.component';
import { CheckboxWidgetComponent } from './checkbox-widget.component';
import { CodeWidgetComponent } from './code-widget.component';
import { ColorPickerWidgetComponent } from './color-picker-widget.component';
import { CommandButtonWidgetComponent } from './command-button-widget.component';
import { GaugeWidgetComponent } from './gauge-widget.component';
import { GraphRealtimeWidgetComponent } from './graph-realtime-widget.component';
import { InputTextWidgetComponent } from './input-text-widget.component';
import { MapWidgetComponent } from './map-widget.component';
import { RangeWidgetComponent } from './range-widget.component';
import { RealTimeDashboardComponent } from './dashboards/realtime/realtime-dashboard';
import { TextWidgetComponent } from './text-widget.component';

// Models
import { Device } from '../models/device.model';

const widgetComponentTypes = {
    'button': ButtonWidgetComponent,
    'card': CardWidgetComponent,
    'checkbox': CheckboxWidgetComponent,
    'code': CodeWidgetComponent,
    'color-picker': ColorPickerWidgetComponent,
    'command-button': CommandButtonWidgetComponent,
    'gauge': GaugeWidgetComponent,
    'graph-realtime': GraphRealtimeWidgetComponent,
    'input-text': InputTextWidgetComponent,
    'map': MapWidgetComponent,
    'range': RangeWidgetComponent,
    'realtime-dashboard': RealTimeDashboardComponent,
    'text': TextWidgetComponent,
};

@Component({
    selector: "app-widgets",
    template: `
        <!-- Row -->
        <div class="row">
            <div *ngFor="let widget of widgets" [ngClass]="widget.class">
                <ng-container #container [device]="device"></ng-container>
            </div>
        </div>
        <!-- Row -->
    `,
})
export class WidgetsComponent implements AfterViewInit {
    @Input() device?: Device;

    @Input() widgets: any[];

    @Input() parent: any;

    @ViewChildren('container', { read: ViewContainerRef })
    private widgetContainers: QueryList<ViewContainerRef>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngAfterViewInit() {
        this.loadComponents();
    }

    private getComponentForWidgetType(widgetType) {
        return widgetComponentTypes[widgetType];
    }

    loadComponents() {
        // console.log('loadComponents: Loading', this.widgetContainers.length, 'components');
        this.widgetContainers.forEach(
            (widgetContainer: ViewContainerRef, index) => {
                const viewComponent = this.getComponentForWidgetType(
                    this.widgets[index].type,
                );

                // console.log('loadComponents:', this.widgets[index].type);
                if (viewComponent) {
                    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                        viewComponent,
                    );
                    const viewContainerRef = widgetContainer;
                    viewContainerRef.clear();
                    const componentRef = viewContainerRef.createComponent(
                        componentFactory,
                    );
                    const instance = componentRef.instance as typeof viewComponent;
                    instance.parent = this.parent;
                    instance.data = this.widgets[index].data || {};
                    instance.device = this.device;
                    componentRef.changeDetectorRef.detectChanges();
                }
            },
        );
    }
}

