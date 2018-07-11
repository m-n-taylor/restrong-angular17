import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Models
import { User } from '../shared/models/user';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { InputService } from '../../shared/services/input.service';
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'ro-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  LOG_TAG = 'ResetPasswordComponent =>';

  email = '';
  resetCode = '';
  newPassword = '';
  newConfirmPassword = '';

  busy = false;

  constructor(private constants: Constants, private ROService: ROService, private userService: UserService, private route: ActivatedRoute, private router: Router, public sharedDataService: SharedDataService, public input: InputService, private toastr: ToastsManager) {

    this.route.queryParams.subscribe((params: any) => {
      this.email = params.email || '';
      this.resetCode = params.code || '';
    });
  }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'Init()');
  }

  resetPassword = () => {
    Util.log(this.LOG_TAG, 'resetPassword()', this.email);

    this.busy = true;

    var requestData = new ROAPIRequestData();

    requestData.e = this.email;
    requestData.c = this.resetCode;
    requestData.p = this.newPassword;
    requestData.p2 = this.newConfirmPassword;

    this.ROService.resetPassword(requestData).subscribe(response => {
      this.busy = false;

      if (response.Status == this.constants.STATUS_SUCCESS) {
        this.sharedDataService.loginUserInfo = this.sharedDataService.loginUserInfo || {};
        this.sharedDataService.loginUserInfo.Email = this.email;
        this.sharedDataService.loginUserInfo.Password = this.newPassword;

        this.email = '';
        this.resetCode = '';
        this.newPassword = '';
        this.newConfirmPassword = '';

        this.toastr.success('Password reset successfully', 'Success!');

        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
      }
      else {
        this.toastr.error('You entered invalid information', 'Error!');
      }

      Util.log(this.LOG_TAG, 'response', response);
    });
  }
}
