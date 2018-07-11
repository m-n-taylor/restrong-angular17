import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { CRMainModule } from "../cr-main/cr-main.module";

// Shared Components
import { AlertComponent } from "../../shared/components/alert/alert.component";
import { AddUserPaymentModalComponent } from "../../shared/components/add-user-payment-modal/add-user-payment-modal.component";
import { ChooseUserPaymentModalComponent } from "../../shared/components/choose-user-payment-modal/choose-user-payment-modal.component";
import { ShoppingCartModalComponent } from "../../shared/components/shopping-cart-modal/shopping-cart-modal.component";

// CR Shared Components
import { FiltersComponent } from "../shared/components/filters/filters.component";
import { DishItemComponent } from "../shared/components/dish-item/dish-item.component";
import { MenuItemComponent } from "../shared/components/menu-item/menu-item.component";
import { SearchBoxComponent } from "../shared/components/search-box/search-box.component";
import { NoResultPlaceholderComponent } from "../shared/components/no-result-placeholder/no-result-placeholder.component";
import { MenuItemOptionsModalComponent } from "../shared/components/menu-item-options-modal/menu-item-options-modal.component";
import { ManageUserAddressesModalComponent } from "../shared/components/manage-user-addresses-modal/manage-user-addresses-modal.component";

// Components
import { HomeComponent } from "../home/home.component";
import { SEOCuisineListComponent } from "../seo-cuisine-list/seo-cuisine-list.component";
import { SEODishListComponent } from "../seo-dish-list/seo-dish-list.component";
import { SEOMenuItemListComponent } from "../seo-menu-item-list/seo-menu-item-list.component";
import { SearchComponent } from "../search/search.component";
import { MenuComponent } from '../menu/menu.component';
import { LoginComponent } from '../login/login.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { RegisterComponent } from '../register/register.component';
import { PastOrdersComponent } from '../past-orders/past-orders.component';
import { MenuMapViewComponent } from '../menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from '../rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from '../user-payments/user-payments.component';
import { UserAddressesComponent } from '../user-addresses/user-addresses.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { PastOrderDetailsComponent } from '../past-order-details/past-order-details.component';
import { RestaurantDetailsComponent } from '../restaurant-details/restaurant-details.component';

@NgModule({
	imports: [ CRMainModule ],
	declarations: [ 
		// Shared Components
		AlertComponent,
		MenuItemOptionsModalComponent,
		AddUserPaymentModalComponent,
		ChooseUserPaymentModalComponent,
		ManageUserAddressesModalComponent,

		// CR Shared Components
		DishItemComponent,
		MenuItemComponent,
		FiltersComponent,
		SearchBoxComponent,
		NoResultPlaceholderComponent,

		HomeComponent,
		SEOCuisineListComponent,
		SEODishListComponent,
		SEOMenuItemListComponent,
		MenuComponent,
		LoginComponent,
		SearchComponent,
		CheckoutComponent,
		RegisterComponent,
		PastOrdersComponent,
		MenuMapViewComponent,
		RestMapViewComponent,
		UserPaymentsComponent,
		UserAddressesComponent,
		ResetPasswordComponent,
		ChangePasswordComponent,
		ForgotPasswordComponent,
		PastOrderDetailsComponent, 
		RestaurantDetailsComponent
	 ],
	exports: []
})
export class CRMainDashboardModule { }