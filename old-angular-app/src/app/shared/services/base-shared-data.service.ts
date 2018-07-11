/**
 * SharedData
 */
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../util';
import { Constants } from '../constants';

// Shared Models
import { Cuisine } from '../models/cuisine';
import { ServiceFee } from '../models/service-fee';
import { SharedData } from '../models/shared-data';
import { BaseSharedData } from '../models/base-shared-data';
import { QueryParams } from '../models/query-params';
import { UserAddress } from '../models/user-address';
import { TaxRateAPIRequestData } from '../models/tax-rate-api-request-data';
import { SearchMenuAPIRequestData } from '../models/search-menu-api-request-data';

// Shared Services
import { EventsService } from './events.service';
import { AppService } from './app.service';

export abstract class BaseSharedDataService {
    private readonly LOG_TAG = 'BaseSharedDataService =>';

    protected SHARED_DATA_KEY = '';

    protected _data: BaseSharedData;

    constructor(public platformId: Object, protected eventsService: EventsService, protected appService: AppService, protected route: ActivatedRoute, protected constants: Constants, sharedDataKey: string, private storageType: string) {
        Util.log(this.LOG_TAG, 'constructor()');

        this.SHARED_DATA_KEY = sharedDataKey;
    }

    protected loadSharedData = (): BaseSharedData => {

        // Restore fields from sessionStorage/localStorage if exists
        var sharedDataStr = window[this.storageType].getItem(this.SHARED_DATA_KEY);

        if (Util.isDefined(sharedDataStr)) {
            return <BaseSharedData>JSON.parse(sharedDataStr);
        }
        else {
            return {};
        }

    }

    public save = () => {

        if (isPlatformBrowser(this.platformId)) {
            window[this.storageType].setItem(this.SHARED_DATA_KEY, JSON.stringify(this._data));

            Util.log('saving shared');
        }

    }
}