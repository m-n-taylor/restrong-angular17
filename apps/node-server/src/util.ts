import { Constants } from "./constants";

export class Util {

    constructor(private constants: Constants) {
    }

    public static log = (...args: any[]) => {
        if (Constants.DEBUG_LOG) {
            args.unshift(Math.round(Math.random() * 100000000));
            console.log.apply(console, args);
        }
    }

    public static replaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    public static isEmail(email: string) {
        var re = Constants.PATTERN_EMAIL;
        return re.test(email);
    }

    public static isNumberOnly(text: any) {
        return /^\d+$/.test(text);
    }

    public static isPhone(text: any) {
        return Constants.PATTERN_PHONE.test(text);
    }

    public static isEmpty(val: any) {
        return !val || !val.toString().length;
    }

    public static isDefined(value: any) {
        return typeof value !== 'undefined' && value;
    }

}