/**
 * SharedData
 */
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../shared/util';
import { Constants } from '../../../shared/constants';

// RO Models
import { SharedData } from '../models/shared-data';
import { SideMenu } from '../models/sidemenu';

// Shared Services
import { BaseSharedDataService } from '../../../shared/services/base-shared-data.service';
import { EventsService } from '../../../shared/services/events.service';
import { AppService } from '../../../shared/services/app.service';

@Injectable()
export class SharedDataService extends BaseSharedDataService {
    private _loginUserInfo: any = {};

    breadcrumbs = [];

    constructor(@Inject(PLATFORM_ID) public platformId: Object, protected eventsService: EventsService, protected appService: AppService, protected route: ActivatedRoute, protected constants: Constants) {
        super(platformId, eventsService, appService, route, constants, 'rsdk', 'localStorage');

        this._data = new SharedData();

        if (isPlatformBrowser(this.platformId)) {
            Util.merge(this._data, this.loadSharedData());

            if (this.sideMenu.isOpened == null) {
                this.toggleSideMenu('desktop');
            }

            this.save();

            window.addEventListener('resize', () => {
                var width = window.innerWidth;

                if (width <= this.COL_SM_MAX) {
                    if (this.sideMenu.isOpened) {
                        this.toggleSideMenu();
                    }
                }

                // if (width > this.COL_XS_MAX) {
                //     if (this.isMobileMenuOpen) {
                //         this.toggleMobileMenu();
                //     }
                // }

                // Util.log('window width', window.innerWidth);
            });
        }

        Util.log('SharedData constructor()');
    }

    private get data(): SharedData {
        return (<SharedData>this._data);
    }

    private set data(sharedData: SharedData) {
        this._data = sharedData;
    }

    public get sideMenu(): SideMenu {
        return this.data.sideMenu
    }

    public set sideMenu(v: SideMenu) {
        this.data.sideMenu = v;
    }

    public toggleSideMenu(device?: string) {
        if (device) {
            if (device == 'mobile' && window.innerWidth <= this.COL_SM_MAX) {
                this._toggleSideMenu();
            }
            if (device == 'desktop' && window.innerWidth > this.COL_SM_MAX) {
                this._toggleSideMenu();
            }
        }
        else {
            this._toggleSideMenu();
        }
    }

    private _toggleSideMenu() {
        this.sideMenu.isOpened = !this.sideMenu.isOpened;

        // Util.enableBodyScroll(!this.sideMenu.isOpened);

        this.save();
    }

    public get globalSettings(): any {
        return this.data.globalSettings
    }

    public set globalSettings(v: any) {
        this.data.globalSettings = v;
    }

    public get pageSizeList(): any {
        return this.data.pageSizeList;
    }

    // public set pageSizeList(v: any) {
    //     this.data.pageSizeList = v;
    // }

    public get loginUserInfo(): any {
        return this._loginUserInfo;
    }

    public set loginUserInfo(v: any) {
        this._loginUserInfo = v;
    }
}