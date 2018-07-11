import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { RestaurantDetailsComponent } from './restaurant-details.component';
import { RestaurantDetailsRoutingModule } from './restaurant-details-routing.module';
import { MenuItemOptionsModalModule } from '../shared/components/menu-item-options-modal/menu-item-options-modal.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    RestaurantDetailsRoutingModule,
    MenuItemOptionsModalModule
  ],
  declarations: [
    RestaurantDetailsComponent
  ]
})
export class RestaurantDetailsModule { }
