import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { PastOrderDetailsComponent } from './past-order-details.component';
import { PastOrderDetailsRoutingModule } from './past-order-details-routing.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    PastOrderDetailsRoutingModule,
  ],
  declarations: [
    PastOrderDetailsComponent
  ]
})
export class PastOrderDetailsModule { }
