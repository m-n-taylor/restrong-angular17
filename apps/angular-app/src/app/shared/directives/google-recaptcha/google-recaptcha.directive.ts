import { Directive, ElementRef, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

declare var grecaptcha: any;

@Directive({
    selector: 'google-recaptcha',
    providers: [NgModel],
    host: {
        '(input)': 'onInputChange()'
    }
})
export class GoogleRecaptchaDirective implements OnInit {
    @Input('theme') theme: string = '';
    @Input('siteKey') siteKey: string;
    @Output('setVerified') setVerified: EventEmitter<any> = new EventEmitter();
    modelValue: any;
    private _el: HTMLElement;
    private widgetID: number;

    constructor(el: ElementRef, private model: NgModel) {
        this._el = el.nativeElement;
        this.modelValue = this.model;
        var input = this._el;
    }

    ngOnInit() {
        setTimeout(() => {
            this.widgetID = grecaptcha.render(this._el, {
                'sitekey': this.siteKey,
                'callback': (data) => {
                    if (data) {
                        this.setVerified.emit(grecaptcha.getResponse(this.widgetID));
                    }
                },
                'expired-callback': (value) => {
                    this.setVerified.emit(null);
                },
                'theme': this.theme
            });
        }, 1000)
    };

    onInputChange() {
    }
}