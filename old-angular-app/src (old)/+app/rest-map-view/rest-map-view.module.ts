import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { RestMapViewComponent } from './rest-map-view.component';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuItemOptionsModalModule } from '../shared/components/menu-item-options-modal/menu-item-options-modal.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    MenuItemOptionsModalModule
  ],
  declarations: [
    RestMapViewComponent
  ]
})
export class RestMapViewModule { }
