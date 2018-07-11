import { Component, Input, Output, EventEmitter } from '@angular/core';

// Shared Helpers
import { Constants } from '../../../../shared/constants';
import { Util } from '../../../../shared/util';

// Shared Models
import { Cuisine } from '../../../../shared/models/cuisine';
import { CartItem } from '../../../../shared/models/cart-item';
// import { QueryParams } from '../../../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { EventsService } from '../../../../shared/services/events.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { ShoppingCart } from "../../services/shopping-cart.service";
import { FiltersService } from "../../services/filters.service";

@Component({
    selector: 'filters',
    templateUrl: './filters.component.html'
})
export class FiltersComponent {
    LOG_TAG = 'FiltersComponent =>';

    // @Input() queryParams: QueryParams;
    // @Output() filtersChanged: EventEmitter<any> = new EventEmitter<any>();
    //, private filtersService: FiltersService
    constructor(public constants: Constants, public sharedDataService: SharedDataService, private appService: AppService, public eventsService: EventsService, private shoppingCart: ShoppingCart, public filtersSerivce: FiltersService) {
        this.filtersSerivce.updateFiltersValue();
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit');
    }

    // changeServiceType = (serviceType) => {
    //     this.sharedDataService.serviceType = serviceType;

    //     this.applyFilter();
    // }
}
