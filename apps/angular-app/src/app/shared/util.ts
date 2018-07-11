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

    public static readAsDataURL = (file) => {
        var resolve = null;
        var reject = null;

        var promise = new Promise<any>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        return promise;
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

    public static scrollLeft(element, to, duration) {
        if (duration <= 0) return;
        var difference = to - element.scrollLeft;
        var perTick = difference / duration * 10;

        setTimeout(function () {
            element.scrollLeft = element.scrollLeft + perTick;
            if (element.scrollLeft === to) return;
            Util.scrollLeft(element, to, duration - 10);
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

    public static sortRandom(array: Array<any>) {
        return array.sort((a, b) => 0.5 - Math.random());
    }

    // Not in use ATM!
    private static _showBodyScroll = (show) => {
        var value = 'auto';

        if (!show) {
            value = 'hidden';
        }

        if (Util.isDefined(window) && Util.isDefined(document)) {
            document.body.style.overflowY = value;
        }
    }

    public static enableBodyScroll = (enable, config?: any) => {
        config = config || {};

        if (enable) {
            if (config.mode == 'hide-scroll') {
                document.body.style.overflowY = null;
            }
            else {
                var top = Math.abs(parseFloat(document.body.style.top));
                document.body.style.top = null;
                document.body.style.position = null;
                document.body.style.overflowY = null;
                document.body.style.width = null;

                document.documentElement.scrollTop = top;
            }
        }
        else {
            if (config.mode == 'hide-scroll') {
                document.body.style.overflowY = 'hidden';
            }
            else {
                document.body.style.top = `-${document.documentElement.scrollTop}px`;
                document.body.style.position = 'fixed';
                document.body.style.overflowY = 'scroll';
                document.body.style.width = '100%';
            }
        }
    }

    public static isAddressValid = (place) => {
        var addrComponents = place.address_components;

        var valid = 0;

        for (var i in addrComponents) {
            var t = addrComponents[i].types[0];

            if (t == 'street_number') {
                valid++;
            } else if (t == 'route') {
                valid++;
            } else if (t == 'postal_code') {
                valid++;
            }
        };

        return valid == 3;
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
        if (!value) {
            // Util.error('replaceSpaceWithDash => Null value', value);
            return value;
        }
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

    public static error = (...args: any[]) => {
        if (Constants.DEBUG)
            console.error.apply(console, args);
    }

    public static isDefined = (value) => {
        return typeof value !== 'undefined' && value;
    }

    public static chunkArray = (arr, chunkSize) => {
        var groups = [], i;
        for (i = 0; i < arr.length; i += chunkSize) {
            groups.push(arr.slice(i, i + chunkSize));
        }
        return groups;
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

    public static isNumberOnly = (text) => {
        return /^\d+$/.test(text);
    }

    public static isPhone = (text) => {
        return /^[0-9\-\+]{10,10}$/.test(text);
    }

    public static makeErrorMessage = (value) => {
        return `Sorry, Unable to ${value} at the moment, Please try again later`;
    }

    public static getShoppingCartIcon = (color: string, size: string) => {
        size = size || '24px';
        var template = `<?xml version="1.0" encoding="UTF-8"?>
                        <svg width="${size}" height="${size}" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>basket</title>
                            <defs></defs>
                            <g id="UI-Kit" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="basket" fill-rule="nonzero" fill="${color}">
                                    <path d="M17.21,10 L12.83,3.44 C12.6400714,3.17105709 12.3291869,3.01374203 12,3.02 C11.68,3.02 11.36,3.16 11.17,3.45 L6.79,10 L2,10 C1.45,10 1,10.45 1,11 C1,11.09 1.01,11.18 1.04,11.27 L3.58,20.54 C3.81,21.38 4.58,22 5.5,22 L18.5,22 C19.42,22 20.19,21.38 20.43,20.54 L22.97,11.27 L23,11 C23,10.45 22.55,10 22,10 L17.21,10 Z M9,10 L12,5.6 L15,10 L9,10 Z" id="Shape"></path>
                                </g>
                            </g>
                        </svg>`;

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(template)}`;
    }

    public static getOtherRestMapIcon = (color: string) => {
        var template = `<?xml version="1.0" encoding="UTF-8"?>
                        <svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>customer-map</title>
                            <defs>
                                <circle id="path-1" cx="20" cy="20" r="8"></circle>
                                <filter x="-68.8%" y="-56.2%" width="237.5%" height="237.5%" filterUnits="objectBoundingBox" id="filter-2">
                                    <feMorphology radius="4" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                                    <feOffset dx="0" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                                    <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                                    <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                                    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                                </filter>
                            </defs>
                            <g id="UI" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="customer-map">
                                    <g id="Oval-2">
                                        <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                                        <use fill="${color}" fill-rule="evenodd" xlink:href="#path-1"></use>
                                        <circle stroke="#FFFFFF" stroke-width="4" cx="20" cy="20" r="10"></circle>
                                    </g>
                                </g>
                            </g>
                        </svg>`;

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(template)}`;
    }
}