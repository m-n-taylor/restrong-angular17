import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// 3rd Party libs
import { DndModule } from 'ng2-dnd';

// Shared Modules
import { SharedModule } from '../../shared.module';

// Shared Components
import { VerifyEmailComponent } from '../../shared/components/verify-email/verify-email.component';
import { Ng2BreadcrumbModule, BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';
import { CanDeactivateGuard } from '../../shared/services/can-deactivate-guard.service';

// Shared Pipes
import { PhonePipe } from "../../shared/pipes/phone";

// RO Components
import { ROMainComponent } from './ro-main.component';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { PaginationComponent } from '../shared/components/pagination/pagination.component';

// RO Components
import { FoodBytesComponent } from '../food-bytes/food-bytes.component';
import { FoodBytesDetailsComponent } from '../food-bytes-details/food-bytes-details.component';
import { HomeComponent } from '../home/home.component';
import { PricingComponent } from '../pricing/pricing.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { LoginComponent as ROLoginComponent } from '../login/login.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ROMainDashboardComponent } from '../ro-main-dashboard/ro-main-dashboard.component';
import { ManageRestaurantComponent } from '../manage-restaurant/manage-restaurant.component';
import { RestaurantPreviewComponent } from '../restaurant-preview/restaurant-preview.component';
import { RestaurantMenuItemsComponent } from '../restaurant-menu-items/restaurant-menu-items.component';
import { RestaurantDishesComponent } from '../restaurant-dishes/restaurant-dishes.component';
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
import { OperaModalComponent } from '../shared/components/opera-modal/opera-modal.component';
import { RequestDemoComponent } from '../shared/components/request-demo/request-demo.component';

// RO Services
import { UserService } from '../shared/services/user.service';
import { CanActivateViaAuthGuard } from '../shared/services/can-activate-auth.guard';
import { CanActivateUserTermsGuard } from '../shared/services/can-activate-user-terms.guard';
import { CanActivateAdminGuard } from '../shared/services/can-activate-admin.guard';
import { CanActivateUserGuard } from '../shared/services/can-activate-user.guard';
import { CanActivateAgentGuard } from '../shared/services/can-activate-agent.guard';
import { ManagePaymentsComponent } from "../manage-payments/manage-payments.component";
import { ManagePlatformComponent } from "../manage-platform/manage-platform.component";

import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { ToastOptions } from 'ng2-toastr';
import { RestrictOnMobileAppAuthGuard } from '../../shared/services/restrict-on-mobile-app-guard';
import { Util } from '../../shared/util';
import { CanActivateBackofficeGuard } from '../shared/services/can-activate-backoffice.guard';

export class CustomToastOption extends ToastOptions {
	animate = 'flyRight'; // you can override any options available
	newestOnTop = true;
	showCloseButton = true;
	toastLife = 3000;
}

var ROMainImports = [
	SharedModule,
	FormsModule,
	RouterModule,
	CommonModule,
	Ng2BreadcrumbModule.forRoot(),
	DndModule.forRoot(),
	ToastModule.forRoot(),

	RouterModule.forRoot([
		{
			path: Path.RO.BASE, component: ROMainComponent, children: [
				{ path: '', component: HomeComponent, canActivate: [RestrictOnMobileAppAuthGuard] },
				{
					path: '', canActivate: [CanActivateBackofficeGuard], children: [
						{ path: 'pricing', component: PricingComponent },
						{ path: 'pricing/:type', component: PricingComponent },

						{
							path: '', component: ROMainDashboardComponent, canActivate: [CanActivateViaAuthGuard, CanActivateUserTermsGuard], children: [
								{ path: Path.RO.FOOD_BYTES, component: FoodBytesComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.FOOD_BYTES + '/:id', component: FoodBytesDetailsComponent, canActivate: [CanActivateUserGuard] },
								// { path: 'dashboard', component: DashboardComponent },

								{ path: Path.RO.MANAGE_RESTAURANT, component: ManageRestaurantComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID', component: EditRestaurantComponent, canActivate: [CanActivateUserGuard], canDeactivate: [CanDeactivateGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.MENU_DETAILS + '/:id', component: MasterHeadDetailsComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.PREVIEW + '/:id', component: RestaurantPreviewComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.DISHES, component: RestaurantDishesComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.MENU_ITEMS, component: RestaurantMenuItemsComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.ORDER_DETAILS + '/:id', component: OrderDetailsComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.ORDER_DETAILS + '/:id/edit', component: EditOrderComponent },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.MENU_DETAILS + '/:masterHeadID/' + Path.RO.CATEGORY_DETAILS + '/:id', component: HeadDetailsComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_RESTAURANT + '/:fireFlyID/' + Path.RO.MENU_DETAILS + '/:masterHeadID/' + Path.RO.CATEGORY_DETAILS + '/:headID/menu-item-details/:id', component: MenuItemDetailsComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.MANAGE_PAYMENTS, component: ManagePaymentsComponent, canActivate: [CanActivateAdminGuard] },
								{ path: Path.RO.MANAGE_PLATFORM, component: ManagePlatformComponent, canActivate: [CanActivateAdminGuard] },
								{ path: Path.RO.USERS, component: UsersComponent, canActivate: [CanActivateAdminGuard] },
								{ path: Path.RO.SUPPORT, component: SupportComponent, canActivate: [CanActivateUserGuard] },
								{ path: Path.RO.CHAT, component: ChatComponent }, //, canActivate: [CanActivateAgentGuard]
								{ path: Path.RO.SETTINGS, component: SettingsComponent },
							]
						},
						{ path: Path.RO.LOGIN, component: ROLoginComponent },
						{ path: Path.RO.SIGNUP, component: SignupComponent },
						{ path: Path.RO.FORGOT_PASSWORD, component: ForgotPasswordComponent },
						{ path: Path.RO.RESET_PASSWORD, component: ResetPasswordComponent },
						{ path: Path.RO.TERMS_CONDITIONS, component: TermsConditionsComponent, canActivate: [CanActivateViaAuthGuard] },
						{ path: Path.RO.VERIFY_EMAIL + '/:id', component: VerifyEmailComponent },
					]
				}
			]
		}
	]),
];

@NgModule({
	imports: ROMainImports,
	declarations: [
		HomeComponent,
		PricingComponent,
		LoginComponent,
		SignupComponent,
		ForgotPasswordComponent,
		ResetPasswordComponent,
		OperaModalComponent,
		RequestDemoComponent,

		PaginationComponent,

		PhonePipe,
	],
	exports: [
		SharedModule,
		FormsModule,
		RouterModule,
		CommonModule,

		PaginationComponent,
		Ng2BreadcrumbModule,
		DndModule,

		PhonePipe,
	],
	providers: [
		// Guards
		CanActivateBackofficeGuard,
		CanActivateViaAuthGuard,
		CanActivateUserTermsGuard,
		CanActivateAdminGuard,
		CanActivateUserGuard,
		CanActivateAgentGuard,

		// Services
		UserService,

		{ provide: ToastOptions, useClass: CustomToastOption }
	],
})
export class ROMainModule {
    LOG_TAG = 'ROMainModule';
	
	/**
	 * constructor
	 */
	constructor(private breadcrumbService: BreadcrumbService, private router: Router) {
        Util.log(this.LOG_TAG, 'constructor');
		
		breadcrumbService.hideRoute(`/${Path.RO.BASE}`);

		breadcrumbService.hideRouteRegex(`^/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.MENU_DETAILS}$`);
		breadcrumbService.hideRouteRegex(`^/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.ORDER_DETAILS}$`);
		breadcrumbService.hideRouteRegex(`^/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.PREVIEW}$`);
		breadcrumbService.hideRouteRegex(`^/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.MENU_DETAILS}/[0-9]+/${Path.RO.CATEGORY_DETAILS}$`);
		breadcrumbService.hideRouteRegex(`^/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.MENU_DETAILS}/[0-9]+/${Path.RO.CATEGORY_DETAILS}/[0-9]+/${Path.RO.MENU_ITEM_DETAILS}$`);

		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.FOOD_BYTES}`, 'FoodBytes');

		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, 'Manage Restaurant');
		breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}[A-Za-z0-9\?=&]+$`, 'Manage Restaurant');

		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.USERS}`, 'Users');
		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.SUPPORT}`, 'Support');
		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.SETTINGS}`, 'Settings');
		breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_PLATFORM}`, 'Manage Platform');
	}
}