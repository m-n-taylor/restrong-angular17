import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Directive({
    selector: '[mValidateEqual][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidator), multi: true }
    ]
})
export class EqualValidator implements Validator {
    constructor( @Attribute('mValidateEqual') public validateEqual: string, @Attribute('reverse') public reverse: string) { }

    private get isReverse() {
        if (!this.reverse) return false;
        return this.reverse === 'true' ? true : false;
    }

    validate(c: AbstractControl): { [key: string]: any } {
        // self value
        let value = c.value || '';

        // control value
        let otherElement = c.root.get(this.validateEqual);

        let otherElementValue = otherElement && otherElement.value ? otherElement.value : '';

        // value not equal
        if (otherElement && value !== otherElementValue && !this.isReverse) {
            return {
                mValidateEqual: {
                    valid: false
                }
            }
        }

        // value equal and reverse
        if (otherElement && value === otherElementValue && this.isReverse) {
            if (typeof otherElement.errors !== 'undefined' && otherElement.errors) {
                delete otherElement.errors['mValidateEqual'];

                if (!Object.keys(otherElement.errors).length) otherElement.setErrors(null);
            }
        }

        // value not equal and reverse
        if (otherElement && value !== otherElementValue && this.isReverse) {
            otherElement.setErrors({
                mValidateEqual: {
                    valid: false
                }
            });
        }

        return null;
    }
}