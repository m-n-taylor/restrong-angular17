import { Directive, ElementRef, Output, EventEmitter, HostListener, NgZone } from '@angular/core';
import { Util } from "../../util";

import { NgModel } from '@angular/forms';

declare var CP;

@Directive({
    selector: '[colorPicker]',
    host: {
        "(keyup)": 'onKeyUpChange($event)'
    }, 
    exportAs: "colorPickerRef"
})
export class ColorPickerDirective {
    LOG_TAG = 'ColorPickerDirective =>';

    inputElement = null;
    colorPicker = null;

    @Output() ngModelChange: EventEmitter<any> = new EventEmitter()

    constructor(private _elementRef: ElementRef, private ngModel: NgModel) {
        this.inputElement = this._elementRef.nativeElement;
    }

    ngAfterViewInit() {
        //Util.log(this.LOG_TAG, 'ngAfterViewInit', this.ngModel);

        this.colorPicker = new CP(this.inputElement);
        this.colorPicker.set(this.ngModel.model);

        this.colorPicker.on("enter", (color) => {
            this.onKeyUpChange(null);
        });

        this.colorPicker.on("change", (color) => {
            //Util.log(this.LOG_TAG, 'colorPicker', 'change', color);

            var hexValue = '#' + color;

            this.ngModelChange.emit(hexValue);
        });
    }

    onKeyUpChange = (event) => {
        this.colorPicker.set(this.inputElement.value);
    }

    toggle = () => {
        this.colorPicker[this.colorPicker.visible ? 'exit' : 'enter']();
    }
}