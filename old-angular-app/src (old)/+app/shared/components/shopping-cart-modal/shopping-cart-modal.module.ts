import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

//import { ModalModule } from 'ng2-bootstrap/modal';

import { SharedModule } from '../../shared.module';
import { FiltersComponent } from '../../components/filters/filters.component';
import { ShoppingCartModalComponent } from './shopping-cart-modal.component';

@NgModule({
  imports: [
    //ModalModule.forRoot(),
    InfiniteScrollModule,
    SharedModule
  ],
  declarations: [
    ShoppingCartModalComponent
  ],
  exports: [
    ShoppingCartModalComponent
  ]
})
export class ShoppingCartModalModule { }
