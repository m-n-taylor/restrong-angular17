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
import { ShoppingCart } from '../../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'register',
  templateUrl: './register.component.html',
  providers: []
})
export class RegisterComponent {
  busy: boolean;
  successMessage: string;
  errorMessage: string;

  queryParams: QueryParams;

  user = new User();
  formSubmitted = false;

  step = 1;

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
    Util.log('search constructor()', this.route.params);

    // this.user.FirstName = 'FirstName';
    // this.user.LastName = 'LastName';
    // this.user.Phone = '+111111111111';
    // this.user.Email = 'abuzerasif@gmail.com';
    // this.user.ConfirmEmail = 'abuzerasif@gmail.com';
    // this.user.Password = 'test111';
    // this.user.ConfirmPassword = 'test111';
    // this.user.SecurityAnswer = 'Security answer';

    this.queryParams = new QueryParams();

    this.route.queryParams
      .subscribe((params: any) => {
        QueryParams.fillParams(this.queryParams, params);

        Util.log('QueryParams', params);

        this.initPage();
      });

  }

  initPage() {
    this.loadData();

    Util.log('search universalInit()');
  }

  loadData = () => {
    this.busy = true;

    var requestData = new APIRequestData();

    this.appService.getSecurityQuestion(requestData).subscribe(response => {

      if (Util.isDefined(response) && Util.isDefined(response[0])) {
        this.user.SecurityQuestion = response[0].Question;
      }

      this.busy = false;

      Util.log('getSecurityQuestion()', response);
    });
  }

  nextStep = (formStep1, formStep2, formStep3, formStep4) => {
    this.formSubmitted = true;

    var form = null;

    if (this.step == 1) form = formStep1;
    else if (this.step == 2) form = formStep2;
    else if (this.step == 3) form = formStep3;
    else if (this.step == 4) form = formStep4;

    if (form && form.valid) {
      this.formSubmitted = false;

      if (this.step < 4) {
        this.step++;
      }
      else {
        this.register();
      }
    }

    Util.log('formStep1, formStep2, formStep3, formStep4', formStep1, formStep2, formStep3, formStep4);

    // if (this.step == 4) {
    //   this.register(form);
    // }
    // else {
    //   this.step++;
    // }
  }

  prevStep = () => {
    if(this.step > 0) this.step--;
  }

  register = () => {
    //this.formSubmitted = true;

    Util.log('register');

    //if (form.valid) {
    this.successMessage = '';
    this.errorMessage = '';

    this.busy = true;

    var request = new RegisterAPIRequestData();

    RegisterAPIRequestData.fillUser(request, this.user);

    this.appService.register(request).subscribe(response => {

      if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'CUSTOMER_ADDED') {
        this.successMessage = response.Message;
        alert(this.successMessage);

        this.router.navigate(['/']);
      }
      else {
        this.errorMessage = response.Message;
        alert(this.errorMessage);
      }

      // if (response) {

      //   if (response.Code) {
      //     // in case of error
      //     this.errorMessage = response.Message;

      //     Util.log('login error', response);
      //   }
      //   else {
      //     // in case of success
      //     this.errorMessage = null;

      //     var user = response[0];

      //     this.userService.loginUser = user;

      //     this.router.navigate([this.queryParams.returnUrl || '/'], { queryParams: this.queryParams });

      //     Util.log('user saved in session storage');
      //   }

      // }

      this.formSubmitted = false;
      this.busy = false;

      Util.log('response', response);
    });
    //}
  }
}
