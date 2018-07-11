/**
 * Util
 */

import { Constants } from './constants';

export class Util {
    static get parameters() {
        return [Constants];
    }

    constructor(public constants: Constants) {
        Util.log('utils constructor()');
    }

    public static clone = (obj) => {
        return (JSON.parse(JSON.stringify(obj)));
    }

    public static round = (value, precision?) => {
        return +(parseFloat(value).toFixed(precision || 2));
    }

    public static log = (...args: any[]) => {
        if (Constants.DEBUG)
            console.log.apply(console, args);
    }

    public static isDefined = (value) => {
        return typeof value !== 'undefined' && value;
    }

    public static isEmpty = (value) => {
        if (typeof value === 'string') {
            value = value.trim();
            return value == '';
        }
        else if (typeof value === 'object' && typeof value.length !== 'undefined') {
            return value.length == 0;
        }
        else {
            throw `Util.isEmpty() value must be of type string or array. ${typeof value} is given`;
        }
    }

    public static makeErrorMessage = (value) => {
        return `Sorry, Unable to ${value} at the moment, Please try again later`;
    }
}