import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TransferHttpModule } from '../modules/transfer-http/transfer-http.module';

// Shared Components
import { CheckboxComponent } from "./shared/components/checkbox/checkbox.component";
import { SelectComponent } from "./shared/components/select/select.component";
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { ValidationMessagesComponent } from './shared/components/validation-messages/validation-messages.component';
import { DateTimeComponent } from './shared/components/datetime/datetime.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { TermsOfUseComponent } from './shared/components/terms-of-use/terms-of-use.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { VerifyEmailComponent } from './shared/components/verify-email/verify-email.component';
import { MenuItemOptionListComponent } from './shared/components/menu-item-options-list/menu-item-options-list.component';
import { Ng2BreadcrumbModule, BreadcrumbService } from './shared/components/breadcrumb/breadcrumb.module';

// Shared Directives
import { StopEventDirective } from "./shared/directives/stop-event/stop-event.directive";
import { GoogleRecaptchaDirective } from "./shared/directives/google-recaptcha/google-recaptcha.directive";
import { ValidEmailValidator } from "./shared/directives/valid-email/valid-email.directive";
import { ValidPasswordValidator } from "./shared/directives/valid-password/valid-password.directive";
import { ValidZipCodeValidator } from "./shared/directives/valid-zipcode/valid-zipcode.directive";
import { ValidPhoneValidator } from "./shared/directives/valid-phone/valid-phone.directive";
import { EqualValidator } from "./shared/directives/validate-equal/validate-equal.directive";

// CR Modules
import { CRMainModule } from './consumer/cr-main/cr-main.module';
import { CRMainDashboardModule } from './consumer/cr-main-dashboard/cr-main-dashboard.module';

// CR Components
import { CRMainComponent } from './consumer/cr-main/cr-main.component';
import { CRMainDashboardComponent } from './consumer/cr-main-dashboard/cr-main-dashboard.component';
import { HomeComponent } from './consumer/home/home.component';
import { SearchComponent } from './consumer/search/search.component';
import { MenuComponent } from './consumer/menu/menu.component';
import { LoginComponent } from './consumer/login/login.component';
import { CheckoutComponent } from './consumer/checkout/checkout.component';
import { RegisterComponent } from './consumer/register/register.component';
import { PastOrdersComponent } from './consumer/past-orders/past-orders.component';
import { MenuMapViewComponent } from './consumer/menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from './consumer/rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from './consumer/user-payments/user-payments.component';
import { UserAddressesComponent } from './consumer/user-addresses/user-addresses.component';
import { ResetPasswordComponent } from './consumer/reset-password/reset-password.component';
import { ChangePasswordComponent } from './consumer/change-password/change-password.component';
import { ForgotPasswordComponent } from './consumer/forgot-password/forgot-password.component';
import { PastOrderDetailsComponent } from './consumer/past-order-details/past-order-details.component';
import { RestaurantDetailsComponent } from './consumer/restaurant-details/restaurant-details.component';

// RO Modules
import { ROMainModule } from './rest-owner/ro-main/ro-main.module';
import { ROMainDashboardModule } from './rest-owner/ro-main-dashboard/ro-main-dashboard.module';

// RO Components
import { ROMainComponent } from './rest-owner/ro-main/ro-main.component';
import { DashboardComponent } from './rest-owner/dashboard/dashboard.component';
import { LoginComponent as ROLoginComponent } from './rest-owner/login/login.component';
import { ROMainDashboardComponent } from './rest-owner/ro-main-dashboard/ro-main-dashboard.component';
import { ManageRestaurantComponent } from './rest-owner/manage-restaurant/manage-restaurant.component';
import { EditRestaurantComponent } from './rest-owner/edit-restaurant/edit-restaurant.component';
import { UsersComponent } from './rest-owner/users/users.component';
import { SupportComponent } from './rest-owner/support/support.component';
import { SettingsComponent } from './rest-owner/settings/settings.component';

// 3rd Party Libs
import { MyDatePickerModule } from 'mydatepicker';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { CustomFormsModule } from 'ng2-validation';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        MyDateRangePickerModule,

        Ng2BreadcrumbModule.forRoot(),

        CustomFormsModule,
    ],
    declarations: [

        // Shared Components
        CheckboxComponent,
        SelectComponent,
        PageLoaderComponent,
        ValidationMessagesComponent,
        DateTimeComponent,
        PaginationComponent,
        TermsOfUseComponent,
        PageNotFoundComponent,
        VerifyEmailComponent,
        MenuItemOptionListComponent,

        // Shared Directives
        StopEventDirective,
        GoogleRecaptchaDirective,
        ValidEmailValidator,
        ValidPasswordValidator,
        ValidZipCodeValidator,
        ValidPhoneValidator,
        EqualValidator,
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        MyDateRangePickerModule,
        CustomFormsModule,

        // Shared Components
        CheckboxComponent,
        SelectComponent,
        PageLoaderComponent,
        ValidationMessagesComponent,
        DateTimeComponent,
        PaginationComponent,
        TermsOfUseComponent,
        PageNotFoundComponent,
        VerifyEmailComponent,
        Ng2BreadcrumbModule,
        MenuItemOptionListComponent,

        // Shared Directives
        StopEventDirective,
        GoogleRecaptchaDirective,
        ValidEmailValidator,
        ValidPasswordValidator,
        ValidZipCodeValidator,
        ValidPhoneValidator,
        EqualValidator,
    ],
    providers: [

    ],
})
export class SharedModule { }