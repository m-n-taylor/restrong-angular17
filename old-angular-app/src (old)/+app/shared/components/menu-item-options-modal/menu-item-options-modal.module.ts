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