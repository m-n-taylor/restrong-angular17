import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { PageComponent } from './page.component';
import { PageRoutingModule } from './page-routing.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    PageRoutingModule,
  ],
  declarations: [
    PageComponent
  ]
})
export class PageModule { }
