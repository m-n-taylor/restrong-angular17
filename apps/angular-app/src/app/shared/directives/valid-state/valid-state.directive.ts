import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';

import { Util } from '../../util';

// validation function
function validateValidStateFactory(): ValidatorFn {
    return (c: AbstractControl) => {

        if (Util.isDefined(c.value) && c.value.length > 0) {

            if (c.value.length != 2) {
                return {
                    mValidState: {
                        valid: false,
                        mValidStateMsg: `must be of 2 letters`
                    }
                };
            }
        }

        return null;

    }
}


@Directive({
    selector: '[mValidState][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidStateValidator, multi: true }
    ]
})
export class ValidStateValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateValidStateFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

}