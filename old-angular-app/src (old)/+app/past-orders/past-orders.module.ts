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

// update: 2025-07-31T20:22:13.095877

// update: 2025-08-01T01:03:53.417415
