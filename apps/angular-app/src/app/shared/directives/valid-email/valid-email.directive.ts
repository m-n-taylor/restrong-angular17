import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';

import { Util } from '../../util';

// validation function
function validateValidEmailFactory(): ValidatorFn {
    return (c: AbstractControl) => {

        if (Util.isDefined(c.value) && c.value.length > 0) {
            var test = Util.isEmail(c.value);

            if (!test) {
                return {
                    mValidEmail: {
                        valid: false
                    }
                };
            }
        }

        return null;

    }
}


@Directive({
    selector: '[mValidEmail][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidEmailValidator, multi: true }
    ]
})
export class ValidEmailValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateValidEmailFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

}