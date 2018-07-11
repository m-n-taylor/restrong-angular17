import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { BaseShoppingCart } from "../../../shared/services/base-shopping-cart.service";

import { Constants } from "../../../shared/constants";
import { SharedDataService } from "./shared-data.service";
import { EventsService } from "../../../shared/services/events.service";
import { AppService } from '../../../shared/services/app.service';

/**
 * ShoppingCart
 */

@Injectable()
export class ShoppingCart extends BaseShoppingCart {

    constructor( @Inject(PLATFORM_ID) platformId: Object, sharedData: SharedDataService, constants: Constants, eventsService: EventsService, appService: AppService) {
        super(platformId, sharedData, constants, { key: null }, eventsService, appService);
    }

}