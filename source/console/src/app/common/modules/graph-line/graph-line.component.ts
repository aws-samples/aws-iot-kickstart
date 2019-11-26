import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as ChartPluginAnnotation from 'chartjs-plugin-annotation';
import * as ChartPluginDraggable from 'chartjs-plugin-draggable';
import * as ChartPluginStreaming from 'chartjs-plugin-streaming';

import { ChartPoint } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';

@Component({
    selector: 'app-graph-line',
    template: `
        <div>
            <canvas
                baseChart
                [datasets]="[
                    {
                        data: data || [],
                        label: title,
                        yAxisID: 'y-axis-0',
                        fill: false,
                        borderColor: 'rgb(0, 0, 255)',
                        backgroundColor: 'rgb(0, 0, 255)',
                        borderWidth: 1
                    }
                ]"
                [options]="options"
                [plugins]="chartPlugins"
                [legend]="true"
                [labels]="labels"
                [chartType]="'line'"
            ></canvas>
        </div>
    `
})

// template: `
//         <div class="card card-outline-info">
//             <div class="card-body">
//                 <h5 class="card-title">{{ title }}</h5>
//                 <h6 class="card-subtitle mb-2 text-muted">{{ value | number: '.2' }}{{ unit }}</h6>
//                 <div class="card-text">
//                     <canvas
//                         baseChart
//                         [datasets]="[
//                             {
//                                 data: data || [],
//                                 label: title,
//                                 yAxisID: 'y-axis-0',
//                                 fill: false,
//                                 borderColor: 'rgb(0, 0, 255)',
//                                 backgroundColor: 'rgb(0, 0, 255)',
//                                 borderWidth: 1
//                             }
//                         ]"
//                         [options]="options"
//                         [plugins]="chartPlugins"
//                         [legend]="true"
//                         [labels]="labels"
//                         [chartType]="'line'"
//                     ></canvas>
//                 </div>
//             </div>
//         </div>
//     `
export class GraphLineComponent implements OnInit, OnChanges {
    @Input() value: any;
    @Input() high: number;
    @Input() low: number;
    @Input() title: string;
    @Input() unit = '';
    @Input() labels: number;
    @Input() data: number[];
    @Input() yMin: any;
    @Input() yMax: any;
    @Input() annotations: any[];
    @Input() type: String;

    @Output() thresholdChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild(BaseChartDirective) chart: BaseChartDirective;

    constructor() {}

    public chartPlugins = [ChartPluginAnnotation, ChartPluginDraggable, ChartPluginStreaming];
    public options: any;

    private setYAxeMinMax(chart) {
        let ticks = {};
        if (this.low) {
            ticks['min'] = this.value - Math.abs(this.low - this.value) * 2;
        }
        if (this.high) {
            ticks['max'] = Math.abs(this.high - this.value) * 2 + this.value;
        }

        if (this.yMin) {
            ticks['min'] = parseFloat(this.yMin);
        }
        if (this.yMax) {
            ticks['max'] = parseFloat(this.yMax);
        }

        if (chart) {
            chart.options.scales.yAxes[0].ticks = ticks;
            chart.update();
        } else {
            this.options.scales.yAxes[0].ticks = ticks;
        }
    }

    ngOnInit() {
        this.options = {
            elements: { point: { hitRadius: 2, hoverRadius: 2, radius: 0 } },
            tooltips: {
                enabled: true
            },
            responsive: true,
            scales: {
                // We use this empty structure as a placeholder for dynamic theming.
                xAxes: [
                    {
                        id: 'x-axis-0',
                        position: 'bottom'
                    }
                ],
                yAxes: [
                    {
                        id: 'y-axis-0',
                        position: 'left',
                        ticks: {}
                    }
                ]
            },
            annotation: {
                events: ['click'],
                annotations: []
            }
        };

        if (this.low) {
            this.options.annotation.annotations.push({
                id: 'lowLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: this.low,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    enabled: true,
                    backgroundColor: '#FF0000',
                    content: `Low ${this.title}`
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    this.low = e.subject.config.value;
                    this.updateThresholds();
                    this.setYAxeMinMax(e.subject.chart);
                }
            });
        }
        if (this.high) {
            this.options.annotation.annotations.push({
                id: 'highLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: this.high,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    backgroundColor: '#FF0000',
                    enabled: true,
                    content: `High ${this.title}`
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    this.high = e.subject.config.value;
                    this.updateThresholds();
                    this.setYAxeMinMax(e.subject.chart);
                }
            });
        }

        if (this.type === 'realtime') {
            this.options.scales.xAxes[0].type = this.type;
            this.options.scales.xAxes[0].realtime = {
                delay: 2000,
                duration: 60000
            };
        }

        if (this.annotations) {
            this.options.annotation.annotations.push(...this.annotations);
        }

        this.setYAxeMinMax(null);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.type === 'realtime') {
            const currentValue = changes.value.currentValue;
            if (this.chart.chart) {
                (this.chart.chart.data.datasets[0].data as ChartPoint[]).push({
                    x: Date.now(),
                    y: currentValue
                });
                this.chart.chart.update({
                    preservation: true
                });
            }
        }
    }

    protected updateThresholds() {
        this.thresholdChanged.emit({
            high: this.high,
            low: this.low
        });
    }
}
