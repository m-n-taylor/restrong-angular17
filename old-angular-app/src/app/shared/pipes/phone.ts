import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phone' })
export class PhonePipe implements PipeTransform {

    transform(value: string, args?: string[]): any {
        if (!value) return value;

        return value.replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");
    }

}