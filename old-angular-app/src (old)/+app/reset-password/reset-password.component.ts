import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { MenuItem } from '../shared/models/menu-item';
import { QueryParams } from '../shared/models/query-params';
import { ResetPassword } from '../shared/models/reset-password';
import { ResetPasswordAPIRequestData } from '../shared/models/reset-password-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  providers: []
})
export class ResetPasswordComponent {
  busy: boolean;
  successMessage: string;
  errorMessage: string;

  queryParams: QueryParams;

  resetPassword = new ResetPassword();
  formSubmitted = false;

  email = '';

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
    Util.log('search constructor()', this.route.params);

    this.queryParams = new QueryParams();

    this.route.queryParams
      .subscribe((params: any) => {

        QueryParams.fillParams(this.queryParams, params);

        Util.log('QueryParams', params);

        this.universalInit();

      });

  }

  universalInit() {
    if (Util.isDefined(this.queryParams.resetCode)) {
      this.resetPassword.resetCode = this.queryParams.resetCode;
    }

    Util.log('search universalInit()');
  }

  requestResetPassword = (form) => {
    this.formSubmitted = true;

    Util.log('form', form);

    if (form.valid) {

      this.successMessage = '';
      this.errorMessage = '';

      this.busy = true;

      var requestData = new ResetPasswordAPIRequestData();

      ResetPasswordAPIRequestData.fillResetPassword(requestData, this.resetPassword);

      //UserPasswordAPIRequestData.fillUserPassword(requestData, this.userPassword);

      //UserPasswordAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

      this.appService.resetPassword(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'SUCCESS_PASSWORD_RESET') {
          this.successMessage = response.Message;

          this.formSubmitted = false;
          this.resetPassword = new ResetPassword();
        }
        else {
          this.errorMessage = response.Message;
        }

        this.busy = false;

        Util.log('response', response);
      });

    }
  }
}