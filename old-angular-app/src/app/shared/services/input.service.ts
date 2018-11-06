import { Injectable } from '@angular/core';

@Injectable()
export class InputService {

    public hasError(form, input) {
        return input.errors && (input.dirty && input.touched || form.submitted);
    }

}
// update: 2025-07-31T20:22:06.117180
