import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

// Shared Components
import { CheckboxComponent } from "./shared/components/checkbox/checkbox.component";
import { RadioComponent } from "./shared/components/radio/radio.component";
import { SelectComponent } from "./shared/components/select/select.component";
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { PageOverlayComponent } from './shared/components/page-overlay/page-overlay.component';
import { ValidationMessagesComponent } from './shared/components/validation-messages/validation-messages.component';
import { DateTimeComponent } from './shared/components/datetime/datetime.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { TermsOfUseComponent } from './shared/components/terms-of-use/terms-of-use.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { VerifyEmailComponent } from './shared/components/verify-email/verify-email.component';
import { MenuItemOptionListComponent } from './shared/components/menu-item-options-list/menu-item-options-list.component';
import { MenuItemComponent } from './shared/components/menu-item/menu-item.component';
import { DishItemComponent } from './shared/components/dish-item/dish-item.component';
import { SiteFooterComponent } from './shared/components/site-footer/site-footer.component';
import { MobileDeviceComponent } from './shared/components/mobile-device/mobile-device.component';
import { MacbookDeviceComponent } from './shared/components/macbook-device/macbook-device.component';
import { TextEditorComponent } from './shared/components/text-editor/text-editor.component';

// Shared Directives
import { StopEventDirective } from "./shared/directives/stop-event/stop-event.directive";
import { GoogleRecaptchaDirective } from "./shared/directives/google-recaptcha/google-recaptcha.directive";
import { ValidEmailValidator } from "./shared/directives/valid-email/valid-email.directive";
import { ValidPasswordValidator } from "./shared/directives/valid-password/valid-password.directive";
import { ValidZipCodeValidator } from "./shared/directives/valid-zipcode/valid-zipcode.directive";
import { ValidPhoneValidator } from "./shared/directives/valid-phone/valid-phone.directive";
import { EqualValidator } from "./shared/directives/validate-equal/validate-equal.directive";
import { NumberValidator } from "./shared/directives/validate-number/validate-number.directive";
import { ValidStateValidator } from "./shared/directives/valid-state/valid-state.directive";
import { ClickOutsideDirective } from "./shared/directives/click-outside/click-outside.directive";
import { ColorPickerDirective } from "./shared/directives/color-picker/color-picker.directive";

// CR Modules
import { CRMainModule } from './consumer/cr-main/cr-main.module';
import { CRMainDashboardModule } from './consumer/cr-main-dashboard/cr-main-dashboard.module';

// RO Modules
import { ROMainModule } from './rest-owner/ro-main/ro-main.module';
import { ROMainDashboardModule } from './rest-owner/ro-main-dashboard/ro-main-dashboard.module';

// 3rd Party Libs
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MyDatePickerModule } from 'mydatepicker';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { CustomFormsModule } from 'ng2-validation';
import { ConfirmModalComponent } from "./shared/components/confirm-modal/confirm-modal.component";
import { LaddaModule } from 'angular2-ladda';
import { SwiperDirective } from './libs/swiper/swiper.directive';
import { NameInitialsPipe } from './shared/pipes/name-initials';
import { QRCodeViewerComponent } from './shared/components/qrcode-viewer/qrcode-viewer.component';

// import { SwiperModule } from 'ngx-swiper-wrapper';
// import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

// const SWIPER_CONFIG: SwiperConfigInterface = {
//     direction: 'horizontal',
//     slidesPerView: 'auto',
//     keyboardControl: true
// };

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        MyDateRangePickerModule,
        LaddaModule,
        // InfiniteScrollModule,
        // Ng2BreadcrumbModule.forRoot(),

        CustomFormsModule,
        // SwiperModule.forRoot(SWIPER_CONFIG),
    ],
    declarations: [

        // Shared Components
        CheckboxComponent,
        RadioComponent,
        SelectComponent,
        PageLoaderComponent,
        PageOverlayComponent,
        ValidationMessagesComponent,
        DateTimeComponent,
        PaginationComponent,
        TermsOfUseComponent,
        PageNotFoundComponent,
        VerifyEmailComponent,
        MenuItemOptionListComponent,
        MenuItemComponent,
        DishItemComponent,
        SiteFooterComponent,
        MobileDeviceComponent,
        MacbookDeviceComponent,
        ConfirmModalComponent,
        TextEditorComponent,
        QRCodeViewerComponent,

        // Shared Directives
        StopEventDirective,
        GoogleRecaptchaDirective,
        ValidEmailValidator,
        ValidPasswordValidator,
        ValidZipCodeValidator,
        ValidPhoneValidator,
        EqualValidator,
        NumberValidator,
        ValidStateValidator,
        ClickOutsideDirective,
        ColorPickerDirective,
        SwiperDirective,

        NameInitialsPipe,
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        MyDateRangePickerModule,
        CustomFormsModule,
        InfiniteScrollModule,
        LaddaModule,

        // Shared Components
        CheckboxComponent,
        RadioComponent,
        SelectComponent,
        PageLoaderComponent,
        PageOverlayComponent,
        ValidationMessagesComponent,
        DateTimeComponent,
        PaginationComponent,
        TermsOfUseComponent,
        PageNotFoundComponent,
        VerifyEmailComponent,
        // Ng2BreadcrumbModule,
        MenuItemOptionListComponent,
        MenuItemComponent,
        DishItemComponent,
        SiteFooterComponent,
        MobileDeviceComponent,
        MacbookDeviceComponent,
        ConfirmModalComponent,
        TextEditorComponent,
        QRCodeViewerComponent,

        // Shared Directives
        StopEventDirective,
        GoogleRecaptchaDirective,
        ValidEmailValidator,
        ValidPasswordValidator,
        ValidZipCodeValidator,
        ValidPhoneValidator,
        EqualValidator,
        NumberValidator,
        ValidStateValidator,
        ClickOutsideDirective,
        ColorPickerDirective,
        SwiperDirective,
        // SwiperModule,

        NameInitialsPipe,
    ],

})
export class SharedModule { }