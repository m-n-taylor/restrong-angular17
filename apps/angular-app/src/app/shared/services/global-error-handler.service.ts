import { ErrorHandler, Injectable } from '@angular/core';
import { Util } from "../util";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor() {

    }

    handleError(error) {

        // Util.log('Global error', JSON.stringify(error));

        // window.location.hash = '';
        // window.location.reload();

        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        throw error;
    }

}