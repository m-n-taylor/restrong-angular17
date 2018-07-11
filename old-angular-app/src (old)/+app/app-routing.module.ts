import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { SearchComponent } from './search/search.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RegisterComponent } from './register/register.component';
import { PastOrdersComponent } from './past-orders/past-orders.component';
import { MenuMapViewComponent } from './menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from './rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from './user-payments/user-payments.component';
import { UserAddressesComponent } from './user-addresses/user-addresses.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PastOrderDetailsComponent } from './past-order-details/past-order-details.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: MainComponent , children: [
          { path: '', component: HomeComponent },
          { path: 'search', component: SearchComponent }, //search/:slug 
          { path: 'menu', component: MenuComponent },
          { path: 'menu-map-view', component: MenuMapViewComponent },
          { path: 'rest-map-view', component: RestMapViewComponent },
          { path: 'restaurant-details', component: RestaurantDetailsComponent },
          { path: 'checkout', component: CheckoutComponent },
          { path: 'user-addresses', component: UserAddressesComponent },
          { path: 'user-payments', component: UserPaymentsComponent },
          { path: 'past-orders', component: PastOrdersComponent },
          { path: 'past-orders/:id', component: PastOrderDetailsComponent },
        ]
      },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'change-password', component: ChangePasswordComponent },
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }