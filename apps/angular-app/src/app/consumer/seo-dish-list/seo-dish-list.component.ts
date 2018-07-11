import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { UserAddress } from '../../shared/models/user-address';
import { QueryParams } from '../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AppService } from '../../shared/services/app.service';

declare var google;

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'cr-seo-dish-list',
    templateUrl: './seo-dish-list.component.html'
})
export class SEODishListComponent {
    LOG_TAG = 'SEODishListComponent';

    serviceType: string;
    autocomplete: any;
    queryParams = new QueryParams();
    yourAdressText = '';

    params: any = {};

    city = null;
    zipcode = null;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute, public constants: Constants, private sharedDataService: SharedDataService, private eventsService: EventsService, private appService: AppService) {

        this.route.params.subscribe((params: any) => {
            Util.log(this.LOG_TAG, 'QueryParams', params);

            this.params = params;

            var city = Util.replaceDashWithSpace(params.city);

            this.appService.getCities({ city: city, zip: params.zipcode }).subscribe((response: any) => {
                var cities: Array<any> = response.City;

                if (cities.length > 0) {
                    this.city = cities[0];

                    if (this.city.ZipInfo.length > 0) {
                        this.zipcode = this.city.ZipInfo[0];

                        // this.loadDishes();
                    }
                }

                Util.log(this.LOG_TAG, 'getCities()', response);
            });
        });
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        if (isPlatformBrowser(this.platformId)) {
        }
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}
