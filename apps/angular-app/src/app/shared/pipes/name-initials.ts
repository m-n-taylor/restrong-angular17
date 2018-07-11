import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nameinitials' })
export class NameInitialsPipe implements PipeTransform {

    transform(value: string, args?: string[]): any {
        if (!value) return value;

        return value.replace(/\W*(\w)\w*/g, '$1').toUpperCase();
    }

}