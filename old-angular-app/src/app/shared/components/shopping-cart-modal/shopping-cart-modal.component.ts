import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// Shared Models
import { MenuItem } from '../../models/menu-item';
import { QueryParams } from '../../models/query-params';
import { SearchMenuAPIRequestData } from '../../models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../services/app.service';
import { BaseModal } from '../../services/base-modal.service';
import { EventsService } from '../../services/events.service';
import { ShoppingCart } from '../../services/shopping-cart.service';

@Component({
  selector: 'shopping-cart-modal',
  templateUrl: './shopping-cart-modal.component.html',
  providers: []
})
export class ShoppingCartModalComponent extends BaseModal {
  totalPrice = 0;
  selectedMenuItem = new MenuItem();

  @ViewChild('modal') public modal: any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  busy: boolean;

  queryParams: QueryParams;

  constructor(private route: ActivatedRoute, private router: Router, public eventsService: EventsService, public constants: Constants, public appService: AppService, public shoppingCart: ShoppingCart) {
    super(eventsService);

    this.queryParams = new QueryParams();

    this.route.queryParams
      .subscribe((params: any) => {

        if (Util.isDefined(params)) {

          if (typeof params.keywords !== 'undefined' && params.keywords && params.keywords != '') {
            this.queryParams.keywords = params.keywords;
          }

          this.queryParams.serviceType = params.serviceType || 'delivery';
          this.queryParams.minPrice = params.minPrice || 0;
          this.queryParams.maxPrice = params.maxPrice || 100;
          // this.queryParams.lat = params.lat;
          // this.queryParams.lng = params.lng;

          Util.log('QueryParams', params);

        }

      });
  }

  open = () => {
    this.openModal();
    this.loadData();
  }

  loadData = () => {
    this.refreshCart();
  }

  refreshCart = () => {
    this.shoppingCart.refresh();
  }

  checkout = () => {

    this.close();

    // Navigating to search component page with queryParams
    this.router.navigate(['checkout'], { queryParams: this.queryParams });

    Util.log('checkout');

  }

  close = () => {
    this.closeModal();
  }

}
