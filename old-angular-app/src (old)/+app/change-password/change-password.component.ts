import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { MenuItem } from '../shared/models/menu-item';
import { QueryParams } from '../shared/models/query-params';
import { ChangePassword } from '../shared/models/change-password';
import { ChangePasswordAPIRequestData } from '../shared/models/change-password-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  providers: []
})
export class ChangePasswordComponent {
  busy: boolean;
  successMessage: string;
  errorMessage: string;

  queryParams: QueryParams;

  userPassword = new ChangePassword();
  formSubmitted = false;

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

  ngOnInit() {

  }

  changePassword = (form) => {
    this.formSubmitted = true;

    Util.log('form', form);

    if (form.valid) {

      this.successMessage = '';
      this.errorMessage = '';

      this.busy = true;

      var requestData = new ChangePasswordAPIRequestData();

      ChangePasswordAPIRequestData.fillUserPassword(requestData, this.userPassword);

      ChangePasswordAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

      this.appService.changePassword(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'PASSWORD_UPDATED') {
          this.successMessage = response.Message;
        }
        else {
          this.errorMessage = response.Message;
        }

        this.userPassword = new ChangePassword();

        this.busy = false;

        Util.log('response', response);
      });

    }
  }
}
