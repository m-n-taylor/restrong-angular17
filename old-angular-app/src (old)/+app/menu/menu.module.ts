import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuComponent } from './menu.component';
import { MenuRoutingModule } from './menu-routing.module';
import { MenuItemOptionsModalModule } from '../shared/components/menu-item-options-modal/menu-item-options-modal.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    MenuRoutingModule,
    MenuItemOptionsModalModule
  ],
  declarations: [
    MenuComponent
  ]
})
export class MenuModule { }
