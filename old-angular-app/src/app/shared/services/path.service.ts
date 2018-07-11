import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

class ROPaths {
    BASE: string;
    FOOD_BYTES: string;
    MANAGE_RESTAURANT: string;
    MENU_DETAILS: string;
    CATEGORY_DETAILS: string;
    MENU_ITEM_DETAILS: string;
    PREVIEW: string;
    ORDER_DETAILS: string;
    USERS: string;
    SETTINGS: string;
    SUPPORT: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
    TERMS_CONDITIONS: string;
    LOGIN: string;
    SIGNUP: string;
    CHAT: string;
    VERIFY_EMAIL: string;
}

/**
 * Path Service
 */
@Injectable()
export class PathService {

    public static RO: ROPaths = {
        BASE: 'backoffice',
        FOOD_BYTES: `food-bytes`,
        MANAGE_RESTAURANT: `manage-restaurant`,
        MENU_DETAILS: `menu-details`,
        CATEGORY_DETAILS: `category-details`,
        MENU_ITEM_DETAILS: `menu-item-details`,
        PREVIEW: `preview`,
        ORDER_DETAILS: `order-details`,
        USERS: `users`,
        SETTINGS: `settings`,
        SUPPORT: `support`,
        FORGOT_PASSWORD: `forgot-password`,
        RESET_PASSWORD: `reset-password`,
        TERMS_CONDITIONS: `terms-conditions`,
        LOGIN: `login`,
        SIGNUP: `signup`,
        CHAT: `chat`,
        VERIFY_EMAIL: `verify-email`,
    };

    // public static getROPaths = () => {
    //     if (!PathService._RO) {
    //         PathService._RO = new ROPaths();
    //     }

    //     return PathService._RO;
    // }

    // public static get RO(): ROPaths {
    //     return PathService._RO;
    // }

    public get RO(): ROPaths {
        return PathService.RO;
    }

    constructor() {

    }

}