import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Models
import { User } from '../shared/models/user';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// RO Shared Components
import { SavePaymentMethodModalComponent } from "../shared/components/save-payment-method-modal/save-payment-method-modal.component";
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ROResponse } from "../shared/models/ro-response";
import { InputService } from "../../shared/services/input.service";
import { ColorPickerModalComponent } from "../shared/components/color-picker-modal/color-picker-modal.component";
import { ColorService } from "../../shared/services/color.service";
import { Restaurant } from "../shared/models/restaurant";
import { PlatformSettings } from '../../shared/models/platform-settings';
import { PlatformSettingsIntroPage } from '../../shared/models/platform-settings-intro-page';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { NgForm } from '@angular/forms/src/directives/ng_form';

import * as _ from "lodash";
import { Subject } from 'rxjs';

declare var NodeVibrant, ClipboardJS;

@Component({
    selector: 'ro-manage-platform',
    templateUrl: './manage-platform.component.html'
})
export class ManagePlatformComponent implements OnInit {
    LOG_TAG = 'ManagePlatformComponent =>';

    PREFIX_APP_ID = 'com.dishzilla.';

    APP_LOGO_MAX_IMG_SIZE = 5;
    APP_ICON_MAX_IMG_SIZE = 5;
    APP_SPLASH_MAX_IMG_SIZE = 8;

    busy = false;
    busySave = false;
    busyAboutText = false;
    busyReturnPolicyText = false;
    busyPrivacyPolicyText = false;
    busyTermsOfUseText = false;
    busyStoreLinks = false;

    deviceType = '';
    deviceWidth = '';
    deviceHeight = '';

    searchText = '';

    serviceTypeError = null;
    introPagesError = null;

    aboutError = null;
    yourPointsError = null;
    returnPolicyError = null;
    privacyPolicyError = null;
    termsOfUseError = null;

    appIconPalette = null;
    appIconPaletteArray = new Array<any>();
    appSplashPalette = null;
    appSplashPaletteArray = new Array<any>();

    platformCompanies = new Array<any>();
    selectedCompany = null;

    platformSettings: PlatformSettings;

    selectedRestAddress = null;
    restAddresses = [];

    selectedIntroPage: PlatformSettingsIntroPage;

    webIframeUrl: any;
    mobileIframeUrl: any;

    selectedPaletteItem = null;

    mobileAppLoaded = false;

    appIDChanged = new Subject<string>();

    public get isPlatform(): boolean {
        return Util.isDefined(this.platformSettings) && Util.isDefined(this.platformSettings.PublicKey) && this.platformSettings.PublicKey.length > 0;
    }

    @ViewChild('mobileIframe') public mobileIframe: any;
    @ViewChild('colorPickerModal') public colorPickerModal: ColorPickerModalComponent;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private router: Router, public userService: UserService, private toastr: ToastsManager, public sharedDataService: SharedDataService, public input: InputService, private sanitizer: DomSanitizer, private colorService: ColorService) {
        this.webIframeUrl = sanitizer.bypassSecurityTrustResourceUrl(this.constants.IFRAME_WEB_APP_URL);
        this.mobileIframeUrl = sanitizer.bypassSecurityTrustResourceUrl(this.constants.IFRAME_MOBILE_APP_URL);

        this.appIDChanged
            .debounceTime(1000) // wait 300ms after the last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .subscribe(this.loadStoreLinks);
    }

    toggleColorPicker = (colorPicker) => {
        Util.log(this.LOG_TAG, 'toggleColorPicker()', colorPicker);
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        if (isPlatformBrowser(this.platformId)) {

            if (this.userService.isAdmin) {
                this.initPage();
            }
            else {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`]);
            }

            new ClipboardJS('.palette-color', {
                text: (trigger) => {
                    this.toastr.success('Color copied!', 'Success!');

                    return trigger.style.backgroundColor;
                }
            });
        }
    }

    initPage = () => {
        this.deviceType = 'iphone8';
        this.onMobileTypeChange();

        this.loadData();

        window.onmessage = (e) => {
            var message = e.data;

            //!this.mobileAppLoaded && 
            if (message.type == 'mobile-app') {

                if (message.action == 'loaded') {
                    Util.log(this.LOG_TAG, 'mobileAppLoaded()');

                    this.publishSettings({ action: 'data' });
                    // this.publishSettings({ action: 'change-address' });
                    this.mobileAppLoaded = true;
                }
            }

            Util.log(this.LOG_TAG, 'initPage()', 'onmessage', e);
        }
    }

    loadData = async () => {
        Util.log(this.LOG_TAG, 'loadData()');

        this.busy = true;

        if (this.userService.isSuperAdmin) {

            // Platform Companies
            this.platformCompanies = await this.ROService.getPlatformCompanies(new ROAPIRequestData());

            if (this.platformCompanies.length > 0) {
                this.selectedCompany = this.platformCompanies[3];
            }
        }

        await this.loadPlatformCompanySettings();

        // Rest List
        var restListResponse = await this.ROService.getRestList(new ROAPIRequestData()).toPromise();

        if (restListResponse.Status == this.constants.STATUS_SUCCESS) {
            var restList = <Array<Restaurant>>restListResponse.Data;

            for (var restListIndex in restList) {
                var rest = restList[restListIndex];

                var address = {
                    Address: `${rest.Address_1} ${rest.Address_2} ${rest.City} ${rest.State} ${rest.ZipCode}`,
                    City: rest.City,
                    State: rest.State,
                    Zip: rest.ZipCode,
                    Country: '',
                    LatLng: `${rest.Latitude},${rest.Longitude}`
                }

                this.restAddresses.push(address);
            }

            if (this.restAddresses.length > 0) {
                this.selectedRestAddress = this.restAddresses[0];
            }

            setTimeout(() => {
                this.busy = false;
                // this.onAddressChanged();
            }, 100);
        }
    }

    loadPlatformCompanySettings = async () => {
        this.platformSettings = null;

        // Platform Company Settings
        var requestData = new ROAPIRequestData();

        if (this.selectedCompany && this.userService.isSuperAdmin) {
            requestData.pcpk = this.selectedCompany.PublicKey;
        }

        var platformSettingsResponse = await this.ROService.getPlatformSettings(requestData);

        if (platformSettingsResponse.Status == this.constants.STATUS_SUCCESS) {
            this.platformSettings = platformSettingsResponse.Data;

            this.afterPlatformSettingsLoaded(this.platformSettings);

            this.applyRules();

            this.platformSettings.IntroPages = this.platformSettings.IntroPages || new Array<PlatformSettingsIntroPage>();

            this.onSettingsChanged();
        }
    }

    onSelectedCompanyChanged = async () => {
        this.busy = true;

        this.mobileAppLoaded = false;

        await this.loadPlatformCompanySettings();

        setTimeout(() => {
            this.busy = false;
        }, 1000);

        try {
            // Init Images
            if (this.platformSettings.App_Icon) {
                var imageColors = await this.getImagePalette(this.platformSettings.App_Icon);
                this.appIconPalette = imageColors.imageColorPalette;
                this.appIconPaletteArray = imageColors.imageColorPaletteArray;
            }

            if (this.platformSettings.App_Splash) {
                var imageColors = await this.getImagePalette(this.platformSettings.App_Splash);
                this.appSplashPalette = imageColors.imageColorPalette;
                this.appSplashPaletteArray = imageColors.imageColorPaletteArray;
            }
        }
        catch (e) { }
    }

    onMobileTypeChange = () => {
        Util.log(this.LOG_TAG, 'onMobileTypeChange');

        if (this.deviceType == 'iphone5s') {
            this.deviceWidth = '320px';
            this.deviceHeight = '568px';
        }
        else if (this.deviceType == 'iphone8') {
            this.deviceWidth = '375px';
            this.deviceHeight = '667px';
        }
        else if (this.deviceType == 'macbook') {
            this.deviceWidth = '960px';
            this.deviceHeight = '600px';
        }
    }

    // Get Image Palette
    getImagePalette = async (src) => {
        var imageColorPalette = await NodeVibrant.from(src).getPalette();

        var imageColorPaletteArray = [];

        for (var key in imageColorPalette) {
            var item = imageColorPalette[key];

            var rgb = null;

            if (item) {
                rgb = {
                    r: Math.round(item.r),
                    g: Math.round(item.g),
                    b: Math.round(item.b),
                };
            }

            imageColorPaletteArray.push({
                name: key,
                value: rgb
            });
        }

        console.log('imageColorPalette', imageColorPalette, imageColorPaletteArray);

        return {
            imageColorPalette: imageColorPalette,
            imageColorPaletteArray: imageColorPaletteArray,
        }
    }

    // Upload Image
    uploadImage = async (type: string, inputElement: HTMLInputElement) => {
        Util.log(this.LOG_TAG, 'inputElement', inputElement);

        this.busy = true;

        var name = null;
        var maxSize = this.constants.RO_MAX_IMG_SIZE;
        var dimentions = null;

        if (type == 'app-logo') {
            name = 'App Logo';
            maxSize = this.APP_LOGO_MAX_IMG_SIZE;
        }
        else if (type == 'app-icon') {
            name = 'App Icon';
            maxSize = this.APP_ICON_MAX_IMG_SIZE;
            dimentions = '1024x1024';
        }
        else if (type == 'app-splash') {
            name = 'App Splash';
            maxSize = this.APP_SPLASH_MAX_IMG_SIZE;
            dimentions = '2732x2732';
        }

        var fileCount: number = inputElement.files.length;

        var formData = new FormData();

        // a file was selected
        if (fileCount > 0) {
            var file = inputElement.files.item(0);

            if (this.constants.RO_IMG_TYPE_PNG != file.type) {
                inputElement.value = '';

                this.toastr.error('Invalid file format. Only PNG is allowed.', 'Sorry!');
            }
            else if (file.size > Util.getBytesByMb(maxSize)) {
                inputElement.value = '';

                this.toastr.error(`File size can't be greater then ${maxSize}MB.`, 'Sorry!');
            }
            else {
                var formData = new FormData();
                formData.append('file[]', file);

                var base64 = await Util.readAsDataURL(file);

                var imageColors = await this.getImagePalette(base64);
                var imageColorPalette = imageColors.imageColorPalette;
                var imageColorPaletteArray = imageColors.imageColorPaletteArray;

                var requestData = new ROAPIRequestData();
                requestData.pcpk = this.platformSettings.PublicKey;

                var response = null;

                if (type == 'app-icon') {
                    response = await this.ROService.uploadAppIconImage(requestData, formData);

                    if (response.Status == this.constants.STATUS_SUCCESS) {
                        this.platformSettings.App_Icon = response.Data;

                        this.appIconPalette = imageColorPalette;
                        this.appIconPaletteArray = imageColorPaletteArray;
                    }
                }
                else if (type == 'app-splash') {
                    response = await this.ROService.uploadAppSplashImage(requestData, formData);

                    if (response.Status == this.constants.STATUS_SUCCESS) {
                        this.platformSettings.App_Splash = response.Data;

                        this.appSplashPalette = imageColorPalette;
                        this.appSplashPaletteArray = imageColorPaletteArray;
                    }
                }

                if (response.Status == this.constants.STATUS_ERROR) {
                    if (response.Code == 'ERR_INVALID_IMG_DIMENSION') {
                        this.toastr.error(`${name ? name : 'Image'} dimentions should be ${dimentions ? dimentions : 'valid'}.`, 'Error!');
                    }
                    else if (response.Code == 'ERR_INVALID_IMG_FORMAT') {
                        this.toastr.error('Invalid file format. Only PNG is allowed.', 'Error!');
                    }
                    else {
                        this.toastr.error('Unable to upload image, Please try again.', 'Error!');
                    }
                }

                // try {
                //     var fileString = await Util.readAsDataURL(file);

                //     var image = new Image();
                //     image.src = fileString;

                //     image.onload = () => {
                //         if (type == 'app-logo') {
                //             this.platformSettings.App_Logo = fileString;
                //         }
                //         else if (type == 'app-icon') {
                //             if (image.width == 1024 && image.height == 1024) {
                //                 this.platformSettings.App_Icon = fileString;
                //             }
                //             else {
                //                 this.toastr.error('File size needs to be 1024x1024', 'Error!');
                //             }
                //         }
                //         else if (type == 'app-splash') {
                //             if (image.width == 2732 && image.height == 2732) {
                //                 this.platformSettings.App_Splash = fileString;
                //             }
                //             else {
                //                 this.toastr.error('File size needs to be 2732x2732', 'Error!');
                //             }
                //         }
                //     };

                //     Util.log(this.LOG_TAG, 'File Read', fileString);
                // }
                // catch (e) {
                //     Util.log(this.LOG_TAG, 'File Read Error', e);
                // }
            }
        }

        this.busy = false;
    }

    // Remove
    removeImage = async (type: string, imageInputElement: HTMLInputElement) => {
        this.busy = true;

        var requestData = new ROAPIRequestData();
        requestData.pcpk = this.platformSettings.PublicKey;

        if (type == 'app-logo') {
            this.platformSettings.App_Logo = null;
        }
        else if (type == 'app-icon') {
            await this.ROService.deleteAppIconImage(requestData);

            this.platformSettings.App_Icon = null;
        }
        else if (type == 'app-splash') {
            await this.ROService.deleteAppSplashImage(requestData);

            this.platformSettings.App_Splash = null;
        }

        imageInputElement.value = '';

        this.busy = false;
    }

    // // Upload App Icon
    // uploadAppIconImage = async (appIconImageElement: HTMLInputElement) => {
    //     Util.log(this.LOG_TAG, 'appIconImageElement', appIconImageElement);

    //     let inputElement: HTMLInputElement = appIconImageElement;

    //     let fileCount: number = inputElement.files.length;

    //     // a file was selected
    //     if (fileCount > 0) {
    //         var file = inputElement.files.item(0);

    //         if (this.constants.RO_IMG_TYPE_PNG != file.type) {
    //             inputElement.value = '';

    //             this.toastr.error('Invalid file format. Only PNG is allowed.', 'Sorry!');
    //         }
    //         else if (file.size > Util.getBytesByMb(this.APP_ICON_MAX_IMG_SIZE)) {
    //             inputElement.value = '';

    //             this.toastr.error(`File size can't be greater then ${this.APP_ICON_MAX_IMG_SIZE}MB.`, 'Sorry!');
    //         }
    //         else {
    //             var formData = new FormData();
    //             formData.append('file[]', file);

    //             var requestData = new ROAPIRequestData();
    //             requestData.pcpk = this.platformSettings.PublicKey;

    //             var response = await this.ROService.uploadAppIconImage(requestData, formData);

    //             if (response.Status == this.constants.STATUS_SUCCESS) {
    //                 this.platformSettings.App_Icon = response.Data;
    //             }
    //             else {
    //                 if (response.Code == 'ERR_INVALID_IMG_DIMENSION') {
    //                     this.toastr.error('Image size should be 1024x1024', 'Error!');
    //                 }
    //                 else if (response.Code == 'ERR_INVALID_IMG_FORMAT') {
    //                     this.toastr.error('Invalid file format. Only PNG is allowed.', 'Error!');
    //                 }
    //                 else {
    //                     this.toastr.error('Unable to upload image, Please try again.', 'Error!');
    //                 }
    //             }

    //             Util.log(this.LOG_TAG, 'uploadAppIconImage', response);
    //         }
    //     }
    // }

    // // Delete App Icon
    // deleteAppIconImage = (appIconImageElement: HTMLInputElement) => {
    //     this.platformSettings.App_Icon = null;

    //     appIconImageElement.value = '';
    // }

    /**
     * Colors
     */
    getRandomPalette = () => {
        Util.log(this.LOG_TAG, 'getRandomPalette');

        var randomNumber = Util.getRandomInt(0, this.colorService.colorPaletteList.length - 1);

        Util.log(this.LOG_TAG, 'randomNumber', randomNumber);

        this.selectPalette(this.colorService.colorPaletteList[randomNumber]);
    }

    selectPalette = (palette) => {
        Util.log(this.LOG_TAG, 'selectPalette', palette);

        this.selectedPaletteItem = palette;

        this.platformSettings.Color_Balanced = this.selectedPaletteItem[0];
        this.platformSettings.Color_Positive = this.selectedPaletteItem[1];
        this.platformSettings.Color_Assertive = this.selectedPaletteItem[2];
        this.platformSettings.Color_Gray = this.selectedPaletteItem[3];
        this.platformSettings.Color_Text1 = this.selectedPaletteItem[3];
        this.platformSettings.Color_Text2 = this.selectedPaletteItem[4];
        this.platformSettings.Color_Text3 = this.selectedPaletteItem[4];

        this.platformSettings.Promo_BGColor = this.selectedPaletteItem[0];
        this.platformSettings.Promo_TabTextColor = this.selectedPaletteItem[1];
        this.platformSettings.Promo_ActiveTabTextColor = this.selectedPaletteItem[2];
        this.platformSettings.Promo_ActiveTabUnderlineColor = this.selectedPaletteItem[3];

        this.platformSettings.Color_UserMapIcon = this.selectedPaletteItem[0];
        this.platformSettings.Color_RestMapIcon = this.selectedPaletteItem[1];
        this.platformSettings.Color_SelectedMapIcon = this.selectedPaletteItem[2];

        this.onSettingsChanged();
    }

    shufflePalette = () => {
        Util.log(this.LOG_TAG, 'shufflePalette');

        var paletteItem = Util.sortRandom(this.selectedPaletteItem);

        this.selectPalette(paletteItem);

        this.onSettingsChanged();
    }

    shuffleGlobalColors = () => {
        Util.log(this.LOG_TAG, 'shuffleGlobalColors');

        var colorsList = [
            this.platformSettings.Color_Balanced,
            this.platformSettings.Color_Positive,
            this.platformSettings.Color_Assertive,
            this.platformSettings.Color_Gray,
            this.platformSettings.Color_Text1,
            this.platformSettings.Color_Text2,
            this.platformSettings.Color_Text3
        ];

        colorsList = Util.sortRandom(colorsList);

        this.platformSettings.Color_Balanced = colorsList[0];
        this.platformSettings.Color_Positive = colorsList[1];
        this.platformSettings.Color_Assertive = colorsList[2];
        this.platformSettings.Color_Gray = colorsList[3];
        this.platformSettings.Color_Text1 = colorsList[4];
        this.platformSettings.Color_Text2 = colorsList[5];
        this.platformSettings.Color_Text3 = colorsList[6];

        this.onSettingsChanged();
    }

    shuffleTopNavigationColors = () => {
        Util.log(this.LOG_TAG, 'shuffleTopNavigationColors');

        var colorsList = [
            this.platformSettings.Promo_BGColor,
            this.platformSettings.Promo_TabTextColor,
            this.platformSettings.Promo_ActiveTabTextColor,
            this.platformSettings.Promo_ActiveTabUnderlineColor
        ];

        colorsList = Util.sortRandom(colorsList);

        this.platformSettings.Promo_BGColor = colorsList[0];
        this.platformSettings.Promo_TabTextColor = colorsList[1];
        this.platformSettings.Promo_ActiveTabTextColor = colorsList[2];
        this.platformSettings.Promo_ActiveTabUnderlineColor = colorsList[3];

        this.onSettingsChanged();
    }

    shuffleMapColors = () => {
        Util.log(this.LOG_TAG, 'shuffleMapColors');

        var colorsList = [
            this.platformSettings.Color_UserMapIcon,
            this.platformSettings.Color_RestMapIcon,
            this.platformSettings.Color_SelectedMapIcon
        ];

        colorsList = Util.sortRandom(colorsList);

        this.platformSettings.Color_UserMapIcon = colorsList[0];
        this.platformSettings.Color_RestMapIcon = colorsList[1];
        this.platformSettings.Color_SelectedMapIcon = colorsList[2];

        this.onSettingsChanged();
    }

    // Page Text
    async generatePageText(form: NgForm, type: string, textEditor: TextEditorComponent) {
        if (form.controls.App_Name.invalid) {
            this.toastr.error('App Name is required.', 'Error!');
        }
        else {
            var requestData = new ROAPIRequestData();
            requestData.n = this.platformSettings.App_Name;

            var result = null;

            if (type == 'about') {
                this.busyAboutText = true;

                result = await this.ROService.getAboutText(requestData);

                this.busyAboutText = false;
            }
            else if (type == 'your-points') {
            }
            else if (type == 'return-policy') {
                if (form.controls.Contact_Email.invalid) {
                    this.toastr.error('Contact Email needs to be a valid email.', 'Error!');
                }
                else {
                    requestData.ns = this.platformSettings.Contact_Email;

                    this.busyReturnPolicyText = true;

                    result = await this.ROService.getReturnPolicyText(requestData);

                    this.busyReturnPolicyText = false;
                }
            }
            else if (type == 'privacy-policy') {
                if (form.controls.Contact_Email.invalid) {
                    this.toastr.error('Contact Email needs to be a valid email.', 'Error!');
                }
                else {
                    requestData.ns = this.platformSettings.Contact_Email;

                    this.busyPrivacyPolicyText = true;

                    result = await this.ROService.getPrivacyPolicyText(requestData);

                    this.busyPrivacyPolicyText = false;
                }
            }
            else if (type == 'terms-of-use') {
                this.busyTermsOfUseText = true;

                result = await this.ROService.getTermOfUseText(requestData);

                this.busyTermsOfUseText = false;
            }

            if (result) {
                textEditor.setHtml(result.Data, false);
            }
        }
    }

    // Color Picker
    openColorPickerModal = () => {
        Util.log(this.LOG_TAG, 'openColorPickerModal');

        this.colorPickerModal.open()
            .then((data) => {
                if (data) {
                    this.selectPalette(data.colorPalette);
                }
            });
    }

    /**
     * Intro Page
     */
    addIntroPage = () => {
        var introPage = new PlatformSettingsIntroPage();
        introPage._isNew = true;

        this.platformSettings.IntroPages.push(introPage);

        this.openIntroPage(introPage);
    }

    openIntroPage = (introPage: PlatformSettingsIntroPage) => {
        introPage._editMode = true;

        this.selectedIntroPage = Util.clone(introPage);
    }

    closeIntroPage = (introPage: PlatformSettingsIntroPage, isCancel?: boolean) => {
        if (isCancel) {
            Util.merge(introPage, this.selectedIntroPage);
        }

        introPage._editMode = false;

        if (introPage._isNew) {
            var index = this.platformSettings.IntroPages.indexOf(introPage);

            if (index > -1) {
                this.platformSettings.IntroPages.splice(index, 1);
            }
        }
    }

    saveIntroPage = (introPage: PlatformSettingsIntroPage, form) => {
        Util.log(this.LOG_TAG, 'saveIntroPage', form);

        if (form.valid) {
            introPage._editMode = false;
            introPage._isNew = false;
        }
    }

    deleteIntroPage = (index: number) => {
        Util.log(this.LOG_TAG, 'deleteIntroPage');

        this.platformSettings.IntroPages.splice(index, 1);
    }

    uploadIntroPageImage = (introPage: PlatformSettingsIntroPage, introPageImage: HTMLInputElement) => {
        Util.log(this.LOG_TAG, 'uploadIntroPageImage', introPageImage);

        let inputElement: HTMLInputElement = introPageImage;

        let fileCount: number = inputElement.files.length;

        let formData = new FormData();

        // a file was selected
        if (fileCount > 0) {
            var file = inputElement.files.item(0);

            if (this.constants.RO_ALLOWED_IMG_TYPES.indexOf(file.type) == -1) {
                inputElement.value = '';

                this.toastr.error('Invalid file format. Only PNG and JPG are allowed.', 'Sorry!');
            }
            else if (file.size > Util.getBytesByMb(this.constants.RO_MAX_IMG_SIZE)) {
                inputElement.value = '';

                this.toastr.error(`File size can't be greater then ${this.constants.RO_MAX_IMG_SIZE}MB.`, 'Sorry!');
            }
            else {
                Util.readAsDataURL(file)
                    .then((fileString) => {
                        introPage.Image = fileString;

                        Util.log(this.LOG_TAG, 'File Read', fileString);

                    }).catch((error) => {
                        Util.log(this.LOG_TAG, 'File Read Error', error);
                    });
            }
        }
    }

    deleteIntroPageImage = (introPage: PlatformSettingsIntroPage, introPageImage: HTMLInputElement) => {
        introPage.Image = null;

        introPageImage.value = '';
    }

    validateIntroPages = () => {
        var valid = true;
        this.introPagesError = null;

        if (this.platformSettings.Enable_Intro_Pages) {

            if (!this.platformSettings.IntroPages.length) {
                valid = false;

                this.introPagesError = 'Atleast 1 Intro Page is required';
            }
            else {
                valid = this.platformSettings.IntroPages.filter(p => p.Enabled).length > 0;

                if (!valid) {
                    this.introPagesError = 'Atleast 1 Intro Page needs to enabled';
                }
            }

        }

        return valid;
    }

    /**
     * Service Types
     */
    validateServiceTypes = () => {
        var valid = true;
        this.serviceTypeError = null;

        if (!this.platformSettings.Enable_Delivery && !this.platformSettings.Enable_Pickup && !this.platformSettings.Enable_Catering && !this.platformSettings.Enable_DiningIn) {
            valid = false;

            this.serviceTypeError = 'Atleast 1 Service Type is required';
        }

        Util.log(this.LOG_TAG, 'validateServiceTypes', valid, this.serviceTypeError);

        return valid;
    }

    getDefaultServiceType = () => {
        var defaultServiceType = this.constants.SERVICE_TYPE_ID_DELIVERY;

        if (this.platformSettings.Enable_Delivery) {
            defaultServiceType = this.constants.SERVICE_TYPE_ID_DELIVERY;
        }
        else if (this.platformSettings.Enable_Pickup) {
            defaultServiceType = this.constants.SERVICE_TYPE_ID_PICKUP;
        }
        else if (this.platformSettings.Enable_Catering) {
            defaultServiceType = this.constants.SERVICE_TYPE_ID_CATERING;
        }
        else if (this.platformSettings.Enable_DiningIn) {
            defaultServiceType = this.constants.SERVICE_TYPE_ID_DINEIN;
        }

        return defaultServiceType;
    }

    /**
     * Pages Text
     */
    textEditorsValueChange = (type, event) => {
        if (type == 'about') {
            this.platformSettings.About_Text = event.isEmpty ? null : event.html;
        }
        else if (type == 'your-points') {
            this.platformSettings.YourPoints = event.isEmpty ? null : event.html;
        }
        else if (type == 'return-policy') {
            this.platformSettings.ReturnPolicy = event.isEmpty ? null : event.html;
        }
        else if (type == 'privacy-policy') {
            this.platformSettings.PrivacyPolicy = event.isEmpty ? null : event.html;
        }
        else if (type == 'terms-of-use') {
            this.platformSettings.TermsOfUse = event.isEmpty ? null : event.html;
        }

        this.onSettingsChanged();

        Util.log(this.LOG_TAG, 'aboutValueChange', event);
    }

    /**
     * On Settings Changed
     */
    onAddressChanged = () => {
        Util.log(this.LOG_TAG, 'onAddressChanged', this.selectedRestAddress);

        this.publishSettings({ action: 'change-address' });
        // this.publishSettings({ action: 'change-address' });
    }

    loadStoreLinks = async () => {
        this.busyStoreLinks = true;

        var appID = `${this.PREFIX_APP_ID}${this.platformSettings.App_ID}`;

        this.platformSettings.App_IOS_Store_Link = 'https://itunes.apple.com';
        this.platformSettings.App_Android_Store_Link = `https://play.google.com/store/apps/details?id=${appID}`;

        var response = await this.ROService.getItunesApp(appID);

        for (var i in response.results) {
            var result = response.results[i];

            if (result.bundleId == appID) {
                this.platformSettings.App_IOS_Store_Link = result.trackViewUrl;
                break;
            }
        }

        this.busyStoreLinks = false;

        Util.log(this.LOG_TAG, 'loadStoreLinks', response);
    }

    onAppNameChanged = () => {
        // this.appBundleID = 

        this.appIDChanged.next(this.platformSettings.App_ID);

        // this.loadStoreLinks();

        this.onSettingsChanged();
    }

    onSettingsChanged = () => {
        var valid = this.coreValidate();

        if (valid) {
            this.publishSettings({ action: 'data' });
        }
    }

    publishSettings = (settings) => {
        var message: any = {
            type: 'iframe-platform-settings',
            platformSettings: this.platformSettings,
            address: this.selectedRestAddress,
            publicKey: this.platformSettings.PublicKey,
            env: Constants.ENV
        }

        Util.merge(message, settings);

        Util.log(this.LOG_TAG, 'publishSettings()', message);

        if (Util.isDefined(this.mobileIframe) && Util.isDefined(this.mobileIframe.nativeElement)) {
            this.mobileIframe.nativeElement.contentWindow.postMessage(message, '*');

            if (message.action == 'reload') {
                this.mobileAppLoaded = false;
            }
        }

        if (Util.isDefined(this.webIframeUrl) && Util.isDefined(this.webIframeUrl.nativeElement)) {
            this.webIframeUrl.nativeElement.contentWindow.postMessage(message, '*');

            if (message.action == 'reload') {
                // this.mobileAppLoaded = false;
            }
        }
    }

    /**
     * Apply criteria after Platform Settings Loaded
     */
    private afterPlatformSettingsLoaded = (platformSettings) => {
        var appID = platformSettings.App_ID || '';
        var appIDArr = appID.split(this.PREFIX_APP_ID);
        platformSettings.App_ID = appIDArr.length > 1 ? appIDArr[1] : '';
    }

    /**
     * Apply criteria before Platform Settings saved
     */
    private beforePlatformSettingsSaved = (platformSettings) => {
        platformSettings.App_ID = this.PREFIX_APP_ID + platformSettings.App_ID;
    }

    /**
     * Apply certain values for platform or not
     */
    private applyRules = () => {
        if (this.isPlatform) {
            this.platformSettings.Enable_Cuisine_Filter = false;
            this.platformSettings.Enable_Points = false;
            this.platformSettings.Enable_View_Mode = false;
            this.platformSettings.Default_View_Mode = this.constants.VIEW_MODE_RESTAURANT;
        }
    }

    /**
     * Core Validation
     */
    coreValidate = () => {
        var valid = true;

        valid = this.validateServiceTypes() && valid;
        valid = this.validateIntroPages() && valid;

        if (valid) {
            this.platformSettings.Default_ServiceType = this.getDefaultServiceType();
        }

        return valid;
    }

    /**
     * Validation
     */
    textEditorsValidate = () => {
        this.aboutError = null;
        this.yourPointsError = null;
        this.returnPolicyError = null;
        this.privacyPolicyError = null;
        this.termsOfUseError = null;

        var valid = true;

        if (this.platformSettings.Enable_About_Text && !this.platformSettings.About_Text) {
            this.aboutError = 'About is required';
            valid = false;
        }
        if (!this.isPlatform && this.platformSettings.Enable_Points && !this.platformSettings.YourPoints) {
            this.yourPointsError = 'Your Points is required';
            valid = false;
        }
        if (!this.platformSettings.ReturnPolicy) {
            this.returnPolicyError = 'Return Policy is required';
            valid = false;
        }
        if (!this.platformSettings.PrivacyPolicy) {
            this.privacyPolicyError = 'Privacy Policy is required';
            valid = false;
        }
        if (!this.platformSettings.TermsOfUse) {
            this.termsOfUseError = 'Term of use is required';
            valid = false;
        }

        return valid;
    }

    onMobileMouseEnter = () => {
        // Util.log(this.LOG_TAG, 'onMobileMouseEnter()');

        Util.enableBodyScroll(false);
    }

    onMobileMouseLeave = () => {
        // Util.log(this.LOG_TAG, 'onMobileMouseLeave()');

        Util.enableBodyScroll(true);
    }

    reloadMobileApp = () => {
        Util.log(this.LOG_TAG, 'reloadMobileApp()');

        this.publishSettings({ action: 'reload' });
    }

    /**
     * Save
     */
    save = (form) => {
        Util.log(this.LOG_TAG, 'save()');

        var valid = form.valid && this.coreValidate() && this.textEditorsValidate();

        if (valid) {
            this.busySave = true;

            this.applyRules();

            var platformSettings: PlatformSettings = _.clone(this.platformSettings);

            this.beforePlatformSettingsSaved(platformSettings);

            var requestData = new ROAPIRequestData();

            if (this.selectedCompany && this.userService.isSuperAdmin) {
                requestData.pcpk = this.selectedCompany.PublicKey;
            }

            this.ROService.savePlatformSettings(requestData, platformSettings).subscribe(response => {
                if (response.Status == this.constants.STATUS_SUCCESS) {

                    this.toastr.success('Settings saved successfully.', 'Success!');

                    // this.publishSettings({ action: 'reload' });
                }

                this.busySave = false;

                Util.log(this.LOG_TAG, 'savePlatformSettings', response);
            });
        }
        else {
            this.toastr.error('Form contains some errors.', 'Error!');
        }
    }
}