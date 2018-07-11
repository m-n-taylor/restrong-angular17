import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { UserAddress } from '../../shared/models/user-address';
import { QueryParams } from '../../shared/models/query-params';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AppService } from '../../shared/services/app.service';
import { SearchMenuAPIRequestData } from "../../shared/models/search-menu-api-request-data";
import { Restaurant } from "../../rest-owner/shared/models/restaurant";
import { ToastsManager } from 'ng2-toastr/src/toast-manager';
import { ShoppingCart } from '../shared/services/shopping-cart.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { HelperService } from '../../shared/services/helper.service';

declare var google, Swiper;

@Component({
    selector: 'landing-page',
    templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
    LOG_TAG = 'LandingPageComponent';

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private helperService: HelperService, private router: Router, private constants: Constants, private appService: AppService, private sharedDataService: SharedDataService) {
        Util.log(this.LOG_TAG, 'constructor');

        this.router.events.filter(e => e instanceof NavigationEnd).first().subscribe(() => {
            // the first navigation is complete and the URL is set

            Util.log(this.LOG_TAG, 'route', this.router.url);

            if (this.router.url == '/') {
                if (this.constants.APP_TYPE.indexOf(this.constants.APP_TYPE_CONSUMER) > -1) {
                    this.loadConsumerPages();
                }
                else if (this.constants.APP_TYPE.indexOf(this.constants.APP_TYPE_BACKOFFICE) > -1) {

                    if (this.constants.APP_TYPE.indexOf(this.constants.APP_TYPE_MOBILE) > -1) {
                        this.router.navigate(['/backoffice/login']);
                    }
                    else {
                        this.router.navigate(['/backoffice']);
                    }
                }
            }
        });
    }

    loadConsumerPages = async () => {
        var requestData = new SearchMenuAPIRequestData();

        SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

        requestData.page = 1;
        requestData.pageSize = 2;
        delete requestData.coordinate;

        var response = await this.appService.searchRestaurant(requestData).toPromise();

        var hasMultiRests = response.Data && response.Data.length && response.Data.length > 1;

        if (!hasMultiRests) {
            var restaurant = response.Data[0];
            this.router.navigate([`/restaurant/${this.helperService.getFirstAvailableServiceType(restaurant)}/${Util.replaceSpaceWithDash(restaurant.CuisineName)}/${Util.replaceSpaceWithDash(restaurant.RestaurantName)}-${Util.replaceSpaceWithDash(restaurant.Address)}/${restaurant.FFID}`]);
        }
        else {
            this.router.navigate(['/search']);
        }
    }

}