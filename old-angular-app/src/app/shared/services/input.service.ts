import { Injectable } from '@angular/core';

@Injectable()
export class InputService {

    public hasError(form, input) {
        return input.errors && (input.dirty && input.touched || form.submitted);
    }

}