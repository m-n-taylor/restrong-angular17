import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../../shared.module';
import { FiltersComponent } from '../../components/filters/filters.component';
import { MenuItemOptionsModalComponent } from './menu-item-options-modal.component';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule
  ],
  declarations: [
    MenuItemOptionsModalComponent
  ],
  exports: [
    MenuItemOptionsModalComponent
  ]
})
export class MenuItemOptionsModalModule { }
// update: 2025-07-31T20:24:27.532616

// update: 2025-08-01T01:06:06.574208
