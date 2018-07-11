import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { MenuModule } from '../menu/menu.module';
import { HomeModule } from '../home/home.module';
import { MainComponent } from './main.component';
import { LoginModule } from '../login/login.module';
import { SharedModule } from '../shared/shared.module';
import { SearchModule } from '../search/search.module';
import { MainRoutingModule } from './main-routing.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { PastOrdersModule } from '../past-orders/past-orders.module';
import { RestMapViewModule } from '../rest-map-view/rest-map-view.module';
import { UserPaymentsModule } from '../user-payments/user-payments.module';
import { UserAddressesModule } from '../user-addresses/user-addresses.module';
import { ResetPasswordModule } from '../reset-password/reset-password.module';
import { ForgotPasswordModule } from '../forgot-password/forgot-password.module';
import { ChangePasswordModule } from '../change-password/change-password.module';
import { PastOrderDetailsModule } from '../past-order-details/past-order-details.module';
import { RestaurantDetailsModule } from '../restaurant-details/restaurant-details.module';
import { ShoppingCartModalModule } from '../shared/components/shopping-cart-modal/shopping-cart-modal.module';

@NgModule({
  declarations: [ MainComponent ],
  imports: [
    InfiniteScrollModule,
    SharedModule,
    HomeModule,
    MainRoutingModule,
    SearchModule,
    MenuModule,
    CheckoutModule,
    RestMapViewModule,
    RestaurantDetailsModule,
    ShoppingCartModalModule,
    UserAddressesModule,
    UserPaymentsModule,
    PastOrdersModule,
    PastOrderDetailsModule,
    ChangePasswordModule,
    ForgotPasswordModule,
    ResetPasswordModule,
  ]
})
export class MainModule {
}

export { MainComponent } from './main.component';