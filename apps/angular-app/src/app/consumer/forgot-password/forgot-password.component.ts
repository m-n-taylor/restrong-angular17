import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';
import { ForgotPassword } from '../../shared/models/forgot-password';
import { ForgotPasswordAPIRequestData } from '../../shared/models/forgot-password-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { InputService } from "../../shared/services/input.service";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { SharedDataService } from '../../shared/services/shared-data.service';

@Component({
	selector: 'forgot-password',
	templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
	LOG_TAG = 'ForgotPasswordComponent';

	isBrowser: boolean;
	busy: boolean;

	queryParams: QueryParams;

	forgotPassword = new ForgotPassword();
	formSubmitted = false;

	emailPhone = '';

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService, public input: InputService, private toastr: ToastsManager, public sharedDataService: SharedDataService) {
		Util.log(this.LOG_TAG, 'search constructor()', this.route.params);

		this.isBrowser = isPlatformBrowser(this.platformId);

		this.queryParams = new QueryParams();

		this.route.queryParams
			.subscribe((params: any) => {
				QueryParams.fillParams(this.queryParams, params);

				Util.log(this.LOG_TAG, 'QueryParams', params);
			});
	}

	sendCode = (form) => {
		Util.log(this.LOG_TAG, 'form', form);

		this.formSubmitted = true;
		var valid = true;

		var requestData = new ForgotPasswordAPIRequestData();

		if (Util.isNumberOnly(this.emailPhone)) {
			// Value is phone number
			requestData.p = this.emailPhone;

			if (!Util.isPhone(requestData.p)) {
				this.toastr.error('Please enter a valid phone number.', 'Error!');
				valid = false;
			}
		}
		else {
			// Value is email
			requestData.e = this.emailPhone;

			if (!Util.isEmail(requestData.e)) {
				this.toastr.error('Please enter a valid e-mail address.', 'Error!');
				valid = false;
			}
		}

		if (form.valid && valid) {
			this.busy = true;

			this.appService.forgotPassword(requestData).subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'SUCCESS_SEND_PASSWORD_RESET') {
					this.formSubmitted = false;
					this.forgotPassword = new ForgotPassword();

					this.router.navigate([`/reset-password`]);
				}
				else {
					this.toastr.error('Invalid Email/Phone', 'Error!');
				}

				this.busy = false;

				Util.log(this.LOG_TAG, 'response', response);
			});
		}
	}
}