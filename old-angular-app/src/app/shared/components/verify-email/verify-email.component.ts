import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// Shared Services
import { AppService } from '../../services/app.service';
import { PathService as Path } from '../../services/path.service';

// RO Services
import { ROService } from '../../../rest-owner/shared/services/ro.service';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'verify-email',
    templateUrl: './verify-email.component.html',
    providers: []
})
export class VerifyEmailComponent {
    LOG_TAG = 'VerifyEmailComponent =>';

    code = '';
    busy = false;

    verifySuccess = false;
    title = '';
    subtitle = '';

    pageType = '';
    PAGE_TYPE_RO = 'PAGE_TYPE_RO';
    PAGE_TYPE_CR = 'PAGE_TYPE_CR';

    SUCCESS_TITLE = 'Success!';
    SUCCESS_SUBTITLE = 'Your email is successfully verified.';

    ERROR_TITLE = 'Error!';
    ERROR_SUBTITLE = 'The link you opened is either invalid or expired.';

    constructor(public constants: Constants, public appService: AppService, public ROService: ROService, private route: ActivatedRoute, private router: Router) {
        Util.log(this.LOG_TAG, 'constructor', this.router.url);

        var url = this.router.url || '';

        if (url.indexOf(`${Path.RO.BASE}/${Path.RO.VERIFY_EMAIL}`) > -1) {
            this.pageType = this.PAGE_TYPE_RO;
        }
        else {
            this.pageType = this.PAGE_TYPE_CR;
        }

        this.route.params.subscribe((params: any) => {
            this.code = params.id || '';

            this.verifyEmail();
        });
    }

    verifyEmail = () => {
        this.busy = true;

        var requestData: any = {};
        requestData.c = this.code;

        if (this.pageType == this.PAGE_TYPE_CR) {

            this.appService.verifyEmail(requestData).subscribe(response => {

                if (response.Code == 'EMAIL_VALIDATED') {
                    this.title = this.SUCCESS_TITLE;
                    this.subtitle = this.SUCCESS_SUBTITLE
                    this.verifySuccess = true;
                }
                else {
                    this.title = this.ERROR_TITLE
                    this.subtitle = this.ERROR_SUBTITLE
                    this.verifySuccess = false;
                }

                this.busy = false;

                Util.log(this.LOG_TAG, 'verifyEmail', this.pageType, response);
            });
        }
        else if (this.pageType == this.PAGE_TYPE_RO) {

            this.ROService.verifyEmail(requestData).subscribe(response => {

                if (response.Status == this.constants.STATUS_SUCCESS) {
                    this.title = this.SUCCESS_TITLE;
                    this.subtitle = this.SUCCESS_SUBTITLE
                    this.verifySuccess = true;
                }
                else {
                    this.title = this.ERROR_TITLE
                    this.subtitle = this.ERROR_SUBTITLE
                    this.verifySuccess = false;
                }

                this.busy = false;

                Util.log(this.LOG_TAG, 'verifyEmail', this.pageType, response);
            });
        }
    }
}