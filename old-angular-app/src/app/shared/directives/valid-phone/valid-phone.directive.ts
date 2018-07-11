import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';

import { Util } from '../../util';

// validation function
function validateValidPhoneFactory(): ValidatorFn {
    return (c: AbstractControl) => {

        if (Util.isDefined(c.value) && c.value.length > 0) {
            var test = /^[0-9\-\+]{10,10}$/.test(c.value);

            // var match = c.value.match(/\d/g);

            // var test = match && match.length === 10;

            if (!test) {
                return {
                    mValidPhone: {
                        valid: false
                    }
                };
            }
        }

        return null;

    }
}


@Directive({
    selector: '[mValidPhone][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidPhoneValidator, multi: true }
    ]
})
export class ValidPhoneValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateValidPhoneFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

}