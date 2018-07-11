import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';
import { ResetPassword } from '../../shared/models/reset-password';
import { ResetPasswordAPIRequestData } from '../../shared/models/reset-password-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { InputService } from '../../shared/services/input.service';
import { SharedDataService } from '../../shared/services/shared-data.service';

@Component({
	selector: 'reset-password',
	templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
	LOG_TAG = 'ResetPasswordComponent =>';

	resetPassword = new ResetPassword();
	resetSuccess = false;
	busy = false;

	constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService, public input: InputService, public sharedDataService: SharedDataService) {
		Util.log(this.LOG_TAG, 'constructor');

		this.route.params.subscribe((params: any) => {
			this.resetPassword.resetCode = params.id || '';
		});
	}

	requestResetPassword = (form) => {
		this.busy = true;

		var requestData = new ResetPasswordAPIRequestData();

		ResetPasswordAPIRequestData.fillResetPassword(requestData, this.resetPassword);

		this.appService.resetPassword(requestData).subscribe(response => {

			if (response.Code == 'ERROR_NO_RECORD') {
				form.controls.resetCode.setErrors({ asyncInvalid: true });
			}
			else if (response.Code == 'SUCCESS_PASSWORD_RESET') {
				this.resetPassword = new ResetPassword();
				this.resetSuccess = true;
			}
			else {
				alert('Unable to reset password');
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'resetPassword', response);
		});
	}
}