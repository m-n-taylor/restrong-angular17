import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { MenuItem } from '../shared/models/menu-item';
import { QueryParams } from '../shared/models/query-params';
import { ForgotPassword } from '../shared/models/forgot-password';
import { ForgotPasswordAPIRequestData } from '../shared/models/forgot-password-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  providers: []
})
export class ForgotPasswordComponent {
  busy: boolean;
  successMessage: string;
  errorMessage: string;

  queryParams: QueryParams;

  forgotPassword = new ForgotPassword();
  formSubmitted = false;

  email = '';

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
    Util.log('search constructor()', this.route.params);

    // this.userPassword.oldPassword = 'test111';
    // this.userPassword.newPassword = 'test111';
    // this.userPassword.confirmPassword = 'test111';

    this.queryParams = new QueryParams();

    this.route.queryParams
      .subscribe((params: any) => {

        QueryParams.fillParams(this.queryParams, params);

        Util.log('QueryParams', params);

        this.universalInit();

      });
  }

  universalInit() {
    Util.log('search universalInit()');
  }

  requestForgotPassword = (form) => {
    this.formSubmitted = true;

    Util.log('form', form);

    if (form.valid) {

      this.successMessage = '';
      this.errorMessage = '';

      this.busy = true;

      var requestData = new ForgotPasswordAPIRequestData();

      ForgotPasswordAPIRequestData.fillForgotPassword(requestData, this.forgotPassword);

      //UserPasswordAPIRequestData.fillUserPassword(requestData, this.userPassword);

      //UserPasswordAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

      this.appService.forgotPassword(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'SUCCESS_SEND_PASSWORD_RESET') {
          this.successMessage = response.Message;

          this.formSubmitted = false;
          this.forgotPassword = new ForgotPassword();
        }
        else {
          this.errorMessage = 'Invalid email address and security code combination.';
        }

        this.busy = false;

        Util.log('response', response);
      });

    }
  }
}