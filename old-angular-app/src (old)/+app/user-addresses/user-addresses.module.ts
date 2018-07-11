import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { UserAddressesComponent } from './user-addresses.component';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
  ],
  declarations: [
    UserAddressesComponent
  ]
})
export class UserAddressesModule { }
