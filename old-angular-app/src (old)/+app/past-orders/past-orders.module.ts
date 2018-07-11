import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { PastOrdersComponent } from './past-orders.component';
import { PastOrdersRoutingModule } from './past-orders-routing.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    PastOrdersRoutingModule,
  ],
  declarations: [
    PastOrdersComponent
  ]
})
export class PastOrdersModule { }
