import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

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

@Component({
  selector: 'ro-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  LOG_TAG = 'ForgotPasswordComponent =>';

  email = '';

  busy = false;

  isBrowser: boolean;

  constructor( @Inject(PLATFORM_ID) private platformId: Object, private constants: Constants, private ROService: ROService, private userService: UserService, private router: Router, public sharedDataService: SharedDataService, public input: InputService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'Init()');
  }

  sendCode = (form) => {
    Util.log(this.LOG_TAG, 'sendCode()', this.email);

    this.busy = true;

    var requestData = new ROAPIRequestData();

    requestData.e = this.email;

    this.ROService.sendPasswordResetCode(requestData).subscribe(response => {
      this.busy = false;

      if (response.Status == this.constants.STATUS_SUCCESS) {
        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.RESET_PASSWORD}`], { queryParams: { email: this.email } });
      }
      else {
        form.controls.email.setErrors({ asyncInvalid: true });
      }

      Util.log(this.LOG_TAG, 'response', response);
    });
  }
}
