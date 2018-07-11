import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';

import { Util } from '../../util';

// validation function
function validateValidZipCodeFactory(): ValidatorFn {
    return (c: AbstractControl) => {

        if (Util.isDefined(c.value) && c.value.length > 0) {
            var test = /^\d{5}(?:[-\s]\d{4})?$/.test(c.value);

            if (!test) {
                return {
                    mValidZipCode: {
                        valid: false
                    }
                };
            }
        }

        return null;

    }
}


@Directive({
    selector: '[mValidZipCode][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidZipCodeValidator, multi: true }
    ]
})
export class ValidZipCodeValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateValidZipCodeFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

}