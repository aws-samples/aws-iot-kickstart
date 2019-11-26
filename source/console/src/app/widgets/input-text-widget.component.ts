import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div class="input-group input-group-sm mb-3">
            <input
                type="text"
                class="form-control"
                placeholder="Text to display"
                aria-label="Text to display"
                aria-describedby="basic-addon2"
                [(ngModel)]="inputText"
            />
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="submit" (click)="submit()">Submit</button>
            </div>
        </div>
    `
})
export class InputTextWidgetComponent extends WidgetComponent {
    private _inputtext = '';

    get inputText() {
        if (typeof this.value === 'string') {
            return this.value;
        } else {
            return '';
        }
    }

    set inputText(value) {
        this._inputtext = value;
    }

    public submit() {
        if (this._inputtext !== '') {
            this.setValue(this._inputtext);
        }
    }
}
