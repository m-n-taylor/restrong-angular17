import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuMapViewComponent } from './menu-map-view.component';
import { MenuItemOptionsModalModule } from '../shared/components/menu-item-options-modal/menu-item-options-modal.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    MenuItemOptionsModalModule
  ],
  declarations: [
    MenuMapViewComponent
  ]
})
export class MenuMapViewModule { }
