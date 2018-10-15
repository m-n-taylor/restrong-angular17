import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    SearchRoutingModule
  ],
  declarations: [
    SearchComponent
  ]
})
export class SearchModule { }

// update: 2025-07-31T20:21:02.224040
