import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'unmaskcardno' })
export class UnMaskCardNoPipe implements PipeTransform {
    transform(value: string, args: string[]): any {
        if (!value) return value;

        var arr = value.split('x');

        if (arr.length > 0)
            return arr[arr.length - 1];
        else return value;
    }
}