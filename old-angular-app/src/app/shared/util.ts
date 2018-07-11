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

    public static merge = (obj1, obj2) => {
        Object.assign(obj1, obj2);
    }

    public static isNewObject = (object) => {
        return !Util.isDefined(object.ID) && !Util.isDefined(object.id);
    }

    public static round = (value, precision?) => {
        return +(parseFloat(value).toFixed(precision || 2));
    }

    public static getMetersByMiles = (miles) => {
        return miles * 1609.344;
    }

    public static getBytesByMb = (bytes) => {
        return bytes * 1024 * 1024;
    }

    public static arrayDiff = (a, b) => {
        return a.filter(function (i) { return b.indexOf(i) < 0; });
    }

    public static scrollTo(element, to, duration) {
        if (duration <= 0) return;
        var difference = to - element.scrollTop;
        var perTick = difference / duration * 10;

        setTimeout(function () {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) return;
            Util.scrollTo(element, to, duration - 10);
        }, 10);
    }

    public static getRandomColor = () => {
        var r = Math.floor(Math.random() * 200);
        var g = Math.floor(Math.random() * 200);
        var b = Math.floor(Math.random() * 200);

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    public static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static getRandomItem(array: Array<any>) {
        return array[Math.floor(Math.random() * array.length)];
    }

    public static hasProperty(obj: any, array: Array<string>): boolean {
        var hasProperty = true;

        for (var i in array) {
            var item = array[i];

            if (typeof obj[item] === 'undefined') {
                hasProperty = false;
                break;
            }
        }

        return hasProperty;
    }

    public static replaceSpaceWithDash = (value: string): string => {
        return value.replace(/\s+/g, '-').toLowerCase();
    }

    public static replaceDashWithSpace = (value: string): string => {
        return value.replace(/\-+/g, ' ').toLowerCase();
    }

    public static detectServiceTypeAtStart = (value: string): string => {
        var constants = new Constants();
        var serviceType = null;

        if (value.startsWith('/' + constants.SERVICE_TYPE_DELIVERY + '/')) {
            serviceType = constants.SERVICE_TYPE_DELIVERY;
        }
        else if (value.startsWith('/' + constants.SERVICE_TYPE_PICKUP + '/')) {
            serviceType = constants.SERVICE_TYPE_PICKUP;
        }
        else if (value.startsWith('/' + constants.SERVICE_TYPE_CATERING + '/')) {
            serviceType = constants.SERVICE_TYPE_CATERING;
        }
        else if (value.startsWith('/' + constants.SERVICE_TYPE_DINEIN + '/')) {
            serviceType = constants.SERVICE_TYPE_DINEIN;
        }

        return serviceType;
    }

    public static showDesktopNotification = (data) => {
        if (!("Notification" in window)) {
        }
        else if (Notification['permission'] === "granted") {
            Util._showDesktopNotification(data);
        }
        else if (Notification['permission'] !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    Util._showDesktopNotification(data);
                }
            });
        }
    }

    private static _showDesktopNotification = (data) => {
        var notification = new Notification(data.title, {
            icon: 'img/ro/push-notification.png',
            body: data.body,
        });

        notification.onclick = () => {
            if (Util.isDefined(data.link)) {
                window.open(data.link);
            }
        };

        setTimeout(notification.close.bind(notification), data.timeout || 5000);
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

    public static isEmail = (value) => {
        return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(value);
    }

    public static makeErrorMessage = (value) => {
        return `Sorry, Unable to ${value} at the moment, Please try again later`;
    }
}