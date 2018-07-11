import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';

import { Util } from '../../util';

// validation function
function validateValidPasswordFactory(): ValidatorFn {
    return (c: AbstractControl) => {

        if (Util.isDefined(c.value) && c.value.length > 0) {
            var test = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(c.value);

            if (!test) {
                return {
                    mValidPassword: {
                        valid: false
                    }
                };
            }
        }

        return null;

    }
}


@Directive({
    selector: '[mValidPassword][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidPasswordValidator, multi: true }
    ]
})
export class ValidPasswordValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateValidPasswordFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }

}