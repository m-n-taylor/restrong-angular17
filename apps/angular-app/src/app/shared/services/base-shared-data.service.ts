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
import { BaseStorageService } from './base-storage.service';

export abstract class BaseSharedDataService extends BaseStorageService {
    private readonly LOG_TAG = 'BaseSharedDataService =>';

    protected SHARED_DATA_KEY = '';

    protected _hideSupportChatWindow = false;
    protected _hideSupportChatWindowUserSession = false;
    protected _data: BaseSharedData;

    public isMobileMenuOpen = false;
    public COL_XS_MAX = 767;
    public COL_SM_MAX = 992;

    constructor(platformId: Object, protected eventsService: EventsService, protected appService: AppService, protected route: ActivatedRoute, protected constants: Constants, sharedDataKey: string, storageType: string) {
        super(platformId, sharedDataKey, storageType);

        Util.log(this.LOG_TAG, 'constructor()');

        this.SHARED_DATA_KEY = sharedDataKey;

        if (isPlatformBrowser(this.platformId)) {
            window.addEventListener('resize', () => {
                var width = window.innerWidth;

                if (width > this.COL_XS_MAX) {
                    if (this.isMobileMenuOpen) {
                        this.toggleMobileMenu();
                    }
                }
            });
        }
    }

    protected loadSharedData = (): BaseSharedData => {

        // Restore fields from sessionStorage/localStorage if exists
        // var sharedDataStr = window[this.storageType].getItem(this.SHARED_DATA_KEY);

        // if (Util.isDefined(sharedDataStr)) {
        //     return <BaseSharedData>JSON.parse(sharedDataStr);
        // }
        // else {
        //     return <BaseSharedData>{};
        // }

        // Restore fields from sessionStorage/localStorage if exists
        var sharedData = this.getLocally();

        if (Util.isDefined(sharedData)) {
            return <BaseSharedData>sharedData;
        }
        else {
            return <BaseSharedData>{};
        }
    }

    // get data(): SharedData {
    //     return (<SharedData>this._data);
    // }

    // set data(sharedData: SharedData) {
    //     this._data = sharedData;
    // }

    public get serviceType(): string {
        return this._data.serviceType;
    }
    public set serviceType(v: string) {
        this._data.serviceType = v;
    }

    public get serviceFee(): ServiceFee {
        return this._data.serviceFee;
    }
    public set serviceFee(v: ServiceFee) {
        this._data.serviceFee = v;
    }

    // public get taxPercent(): number {
    //     return this._data.taxPercent;
    // }
    // public set taxPercent(v: number) {
    //     this._data.taxPercent = v;
    // }

    public get driverTipPercent(): number {
        return this._data.driverTipPercent;
    }
    public set driverTipPercent(v: number) {
        this._data.driverTipPercent = v;
    }

    /**
     * Support Chat Window
     */
    public get hideSupportChatWindow(): boolean {
        return this._hideSupportChatWindow;
    }

    public set hideSupportChatWindow(value: boolean) {
        this._hideSupportChatWindow = value;
    }

    public get hideSupportChatWindowUserSession(): boolean {
        return this._hideSupportChatWindowUserSession;
    }

    public set hideSupportChatWindowUserSession(value: boolean) {
        this._hideSupportChatWindowUserSession = value;
    }

    toggleMobileMenu = () => {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;

        var body = document.querySelector('body');

        if (this.isMobileMenuOpen) {
            body.className += 'no-scroll-mobile ';
        }
        else {
            body.className = body.className.replace(new RegExp('no-scroll-mobile', 'g'), '');
            body.className = body.className.trim();
        }
    }

    public save = () => {

        if (isPlatformBrowser(this.platformId)) {
            this.saveLocally(this._data);
            // window[this.storageType].setItem(this.SHARED_DATA_KEY, JSON.stringify(this._data));

            Util.log(this.LOG_TAG, 'saving shared');
        }

    }
}