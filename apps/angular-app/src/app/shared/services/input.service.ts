import { Injectable } from '@angular/core';

@Injectable()
export class InputService {

    public hasError(form, input) {
        return input.errors && (input.dirty && input.touched || form.submitted);
    }

}
// update: 2025-08-01T01:09:13.931701
