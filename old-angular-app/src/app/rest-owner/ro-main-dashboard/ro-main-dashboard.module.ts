import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ROMainModule } from '../ro-main/ro-main.module';

// RO Shared Components
import { AddUserModalComponent } from '../shared/components/add-user-modal/add-user-modal.component';
import { SaveMasterHeadModalComponent } from '../shared/components/save-masterhead-modal/save-masterhead-modal.component';
import { SaveHeadModalComponent } from '../shared/components/save-head-modal/save-head-modal.component';
import { SaveCouponModalComponent } from '../shared/components/save-coupon-modal/save-coupon-modal.component';
import { OrderStatusHistoryModalComponent } from '../shared/components/order-status-history-modal/order-status-history-modal.component';
import { RestContractModalComponent } from '../shared/components/rest-contract-modal/rest-contract-modal.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { ChatTemplatesModalComponent } from '../shared/components/chat-templates-modal/chat-templates-modal.component';
import { SaveDeliveryZoneModalComponent } from '../shared/components/save-delivery-zone-modal/save-delivery-zone-modal.component';
import { SaveScheduleModalComponent } from '../shared/components/save-schedule-modal/save-schedule-modal.component';
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';
import { MenuItemPreviewModalComponent } from '../shared/components/menu-item-preview-modal/menu-item-preview-modal.component';
import { MenuSearchBoxComponent } from '../shared/components/menu-search-box/menu-search-box.component';
import { RestaurantMenuPreviewComponent } from '../shared/components/restaurant-menu-preview/restaurant-menu-preview.component';
import { MenuItemOptionsComponent } from '../shared/components/menu-item-options/menu-item-options.component';
import { RestaurantCouponsComponent } from '../shared/components/restaurant-coupons/restaurant-coupons.component';
import { RestaurantMenuSenseComponent } from '../shared/components/restaurant-menu-sense/restaurant-menu-sense.component';

// RO Components
import { FoodBytesComponent } from '../food-bytes/food-bytes.component';
import { FoodBytesDetailsComponent } from '../food-bytes-details/food-bytes-details.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ROMainDashboardComponent } from './ro-main-dashboard.component';
import { ManageRestaurantComponent } from '../manage-restaurant/manage-restaurant.component';
import { RestaurantPreviewComponent } from '../restaurant-preview/restaurant-preview.component';
import { EditRestaurantComponent } from '../edit-restaurant/edit-restaurant.component';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { MasterHeadDetailsComponent } from '../masterhead-details/masterhead-details.component';
import { HeadDetailsComponent } from '../head-details/head-details.component';
import { MenuItemDetailsComponent } from '../menu-item-details/menu-item-details.component';
import { UsersComponent } from '../users/users.component';
import { SupportComponent } from '../support/support.component';
import { ChatComponent } from '../chat/chat.component';
import { SettingsComponent } from '../settings/settings.component';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';


@NgModule({
	imports: [ROMainModule],
	declarations: [
		// RO Shared Components
		AddUserModalComponent,
		SaveMasterHeadModalComponent,
		SaveHeadModalComponent,
		SaveCouponModalComponent,
		OrderStatusHistoryModalComponent,
		RestContractModalComponent,
		SaveDeliveryZoneModalComponent,
		SaveScheduleModalComponent,
		MapCustomerRouteModalComponent,
		MenuItemPreviewModalComponent,
		MenuSearchBoxComponent,
		ConfirmModalComponent,
		ChatTemplatesModalComponent,
		RestaurantMenuPreviewComponent,
		MenuItemOptionsComponent,
		RestaurantCouponsComponent,
		RestaurantMenuSenseComponent,

		// RO Components
		FoodBytesComponent,
		FoodBytesDetailsComponent,
		DashboardComponent,
		ManageRestaurantComponent,
		RestaurantPreviewComponent,
		EditRestaurantComponent,
		OrderDetailsComponent,
		EditOrderComponent,
		MasterHeadDetailsComponent,
		HeadDetailsComponent,
		MenuItemDetailsComponent,
		UsersComponent,
		SupportComponent,
		ChatComponent,
		SettingsComponent,
		TermsConditionsComponent,
	],
	exports: [
		ConfirmModalComponent,
		ChatTemplatesModalComponent
	]
})
export class ROMainDashboardModule { }