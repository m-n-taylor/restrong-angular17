import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { Util } from "../../util";

@Directive({
    selector: '[mValidateNumber][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => NumberValidator), multi: true }
    ]
})
export class NumberValidator implements Validator {
    constructor( @Attribute('mMaxDecimalDigits') public mMaxDecimalDigits: string) { }

    validate(c: AbstractControl): { [key: string]: any } {

        // value not equal
        if (Util.isDefined(c.value) && c.value.length > 0) {
            var value = c.value;
            var valueDecimalIndex = value.indexOf('.');

            if (Util.isDefined(this.mMaxDecimalDigits)) {
                var maxDecimal = parseInt(this.mMaxDecimalDigits);

                if (maxDecimal > 0) {
                    if (valueDecimalIndex > 0) {
                        var digitsCount = (value.split('.')[1] || []).length;

                        if (digitsCount > this.mMaxDecimalDigits) {
                            var newValue = value;
                            newValue = value.substring(0, (valueDecimalIndex + maxDecimal + 1));

                            c.setValue(newValue);

                            return null;
                            // return {
                            //     mValidateNumber: {
                            //         valid: false,
                            //         mValidateNumberMsg: `must have ONLY ${this.mMaxDecimalDigits} digits after decimal`
                            //     }
                            // }
                        }
                    }
                }
            }
        }

        return null;
    }
}