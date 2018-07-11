import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { User } from '../../shared/models/user';
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';
import { APIRequestData } from '../../shared/models/api-request-data';
import { RegisterAPIRequestData } from '../../shared/models/register-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { InputService } from "../../shared/services/input.service";
import { SharedDataService } from '../../shared/services/shared-data.service';

@Component({
	selector: 'register',
	templateUrl: './register.component.html',
})
export class RegisterComponent {
	LOG_TAG = 'RegisterComponent';

	busy: boolean;
	busySave: boolean;

	queryParams: QueryParams;

	user = new User();
	formSubmitted = false;

	stepProgress: number;

	private _step: number;
	public get step(): number {
		return this._step;
	}
	public set step(v: number) {
		this._step = v;
		this.stepProgress = this._step * 20;
	}

	formStep1: any;
	formStep2: any;
	formStep3: any;
	formStep4: any;

	constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService, public input: InputService, public sharedDataService: SharedDataService) {
		Util.log(this.LOG_TAG, 'search constructor()', this.route.params);

		this.step = 1;

		if (Constants.DEBUG) {
			this.user.FirstName = 'FirstName';
			this.user.LastName = 'LastName';
			this.user.Phone = '1111111111';
			this.user.Email = 'test@dishzilla.com';
			this.user.ConfirmEmail = 'test@dishzilla.com';
			this.user.Password = 'test1234';
			this.user.ConfirmPassword = 'test1234';
			this.user.SecurityAnswer = 'Security answer';
		}

		this.queryParams = new QueryParams();

		this.route.queryParams
			.subscribe((params: any) => {
				QueryParams.fillParams(this.queryParams, params);

				Util.log(this.LOG_TAG, 'QueryParams', params);

				this.initPage();
			});

	}

	initPage() {
		this.loadData();

		Util.log(this.LOG_TAG, 'search universalInit()');
	}

	loadData = () => {
		this.busy = true;

		var requestData = new APIRequestData();

		this.appService.getSecurityQuestion(requestData).subscribe(response => {

			if (Util.isDefined(response) && Util.isDefined(response[0])) {
				this.user.SecurityQuestion = response[0].Question;
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'getSecurityQuestion()', response);
		});
	}

	submitForm1 = (form) => {
		this.step = 2;
		this.formStep1 = form;
	}

	submitForm2 = (form) => {
		this.step = 3;
		this.formStep2 = form;
	}

	submitForm3 = (form) => {
		this.step = 4;
		this.formStep3 = form;
	}

	submitForm4 = (form) => {
		this.formStep4 = form;
		this.register();
	}

	nextStep = (formStep1, formStep2, formStep3, formStep4) => {
		// this.formSubmitted = true;

		// var form = null;

		// if (this.step == 1) form = formStep1;
		// else if (this.step == 2) form = formStep2;
		// else if (this.step == 3) form = formStep3;
		// else if (this.step == 4) form = formStep4;

		// if (form && form.valid) {
		// 	this.formSubmitted = false;

		// 	if (this.step < 4) {
		// 		this.step++;
		// 	}
		// 	else {
		// 		this.register();
		// 	}
		// }

		// Util.log(this.LOG_TAG, 'formStep1, formStep2, formStep3, formStep4', formStep1, formStep2, formStep3, formStep4);

		// if (this.step == 4) {
		//   this.register(form);
		// }
		// else {
		//   this.step++;
		// }
	}

	prevStep = () => {
		if (this.step > 0) this.step--;
	}

	register = () => {
		//this.formSubmitted = true;

		Util.log(this.LOG_TAG, 'register');

		//if (form.valid) {

		this.busySave = true;

		var request = new RegisterAPIRequestData();

		RegisterAPIRequestData.fillUser(request, this.user);

		this.appService.register(request).subscribe(response => {

			if (Util.isDefined(response.Code)) {
				if (response.Code == 'ERROR_EMAIL_EXISTS') {
					this.step = 2;
					this.formStep2.controls.Email.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` already exists.` });
				}
				else if (response.Code == 'CUSTOMER_ADDED') {
					this.router.navigate(['/login']);
				}
			}
			else {
			}

			// if (response) {

			//   if (response.Code) {
			//     // in case of error
			//     this.errorMessage = response.Message;

			//     Util.log(this.LOG_TAG, 'login error', response);
			//   }
			//   else {
			//     // in case of success
			//     this.errorMessage = null;

			//     var user = response[0];

			//     this.userService.loginUser = user;

			//     this.router.navigate([this.queryParams.returnUrl || '/'], { queryParams: this.queryParams });

			//     Util.log(this.LOG_TAG, 'user saved in session storage');
			//   }

			// }

			this.formSubmitted = false;
			this.busySave = false;

			Util.log(this.LOG_TAG, 'response', response);
		});
		//}
	}
}
