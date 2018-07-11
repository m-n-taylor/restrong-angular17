import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { CRMainModule } from "../cr-main/cr-main.module";

// Shared Components
import { AlertComponent } from "../../shared/components/alert/alert.component";
import { ChooseUserPaymentModalComponent } from "../../shared/components/choose-user-payment-modal/choose-user-payment-modal.component";
import { SupportChatBoxComponent } from '../../shared/components/support-chat-box/support-chat-box.component';

// CR Shared Components
import { SearchBoxComponent } from "../shared/components/search-box/search-box.component";
import { NoResultPlaceholderComponent } from "../shared/components/no-result-placeholder/no-result-placeholder.component";
import { MenuItemOptionsModalComponent } from "../shared/components/menu-item-options-modal/menu-item-options-modal.component";
import { UserAddressListComponent } from "../shared/components/user-address-list/user-address-list.component";
import { UserAddressListModalComponent } from "../shared/components/user-address-list-modal/user-address-list-modal.component";
import { UserPaymentListComponent } from "../shared/components/user-payment-list/user-payment-list.component";

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
import { MenuMapViewComponent } from '../menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from '../rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from '../user-payments/user-payments.component';
import { UserAddressesComponent } from '../user-addresses/user-addresses.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { RestaurantDetailsComponent } from '../restaurant-details/restaurant-details.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { ReturnPolicyComponent } from '../return-policy/return-policy.component';
import { ProfileComponent } from "../shared/components/profile/profile.component";
import { ProfileOrderDetailsComponent } from "../profile-order-details/profile-order-details.component";
import { ProfileOrdersComponent } from "../profile-orders/profile-orders.component";
import { ProfileSettingsComponent } from "../profile-settings/profile-settings.component";
import { SaveUserPaymentModalComponent } from "../shared/components/save-user-payment-modal/save-user-payment-modal.component";
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';
import { CheckoutConfirmAddressModalComponent } from '../shared/components/checkout-confirm-address-modal/checkout-confirm-address-modal.component';
import { MyPointsComponent } from '../my-points/my-points.component';
import { WriteReviewModalComponent } from '../shared/components/write-review-modal/write-review-modal.component';
import { ThankYouPointsModalComponent } from '../shared/components/thank-you-points-modal/thank-you-points-modal.component';
import { ThankYouOrderModalComponent } from '../shared/components/thank-you-order-modal/thank-you-order-modal.component';
import { ProfileOrderChatComponent } from '../profile-order-chat/profile-order-chat.component';
import { LandingPageComponent } from '../landing-page/landing-page.component';

@NgModule({
	imports: [CRMainModule],
	declarations: [
		// Shared Components
		AlertComponent,
		MenuItemOptionsModalComponent,
		SaveUserPaymentModalComponent,
		ChooseUserPaymentModalComponent,
		UserAddressListComponent,
		UserAddressListModalComponent,
		UserPaymentListComponent,
		MapCustomerRouteModalComponent,
		CheckoutConfirmAddressModalComponent,
		WriteReviewModalComponent,
		ThankYouPointsModalComponent,
		ThankYouOrderModalComponent,

		// CR Shared Components
		SearchBoxComponent,
		NoResultPlaceholderComponent,
		ProfileOrdersComponent,
		ProfileOrderDetailsComponent,
		ProfileOrderChatComponent,
		ProfileSettingsComponent,
		MyPointsComponent,

		HomeComponent,
		LandingPageComponent,
		SEOCuisineListComponent,
		SEODishListComponent,
		SEOMenuItemListComponent,
		MenuComponent,
		LoginComponent,
		SearchComponent,
		CheckoutComponent,
		RegisterComponent,
		ProfileComponent,
		MenuMapViewComponent,
		RestMapViewComponent,
		UserPaymentsComponent,
		UserAddressesComponent,
		ResetPasswordComponent,
		ForgotPasswordComponent,
		RestaurantDetailsComponent,
		AboutUsComponent,
		PrivacyPolicyComponent,
		ReturnPolicyComponent,
	],
	exports: []
})
export class CRMainDashboardModule { }