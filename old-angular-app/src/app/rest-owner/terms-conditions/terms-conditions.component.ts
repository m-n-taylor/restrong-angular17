import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'terms-conditions',
  templateUrl: './terms-conditions.component.html'
})
export class TermsConditionsComponent implements OnInit {
  LOG_TAG = 'TermsConditionsComponent';

  isAcceptedTC = false;

  busy = false;

  isBrowser: boolean;

  constructor( @Inject(PLATFORM_ID) private platformId: Object, private ROService: ROService, public userService: UserService, public constants: Constants, private router: Router, private toastr: ToastsManager, public sharedDataService: SharedDataService) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      if (this.userService.loginUser.Terms) {
        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`]);
      }
    }
  }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'ngOnInit()');
  }

  acceptTC = () => {
    Util.log(this.LOG_TAG, 'acceptTC()');

    this.busy = true;

    this.ROService.updateTC().subscribe((userResponse: any) => {

      this.busy = false;

      if (userResponse.Status == this.constants.STATUS_SUCCESS) {
        this.userService.acceptTerms();

        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`]);
      }
      else {
        this.toastr.error('Sorry, Unable to perform this operation. Please try later.');
      }

      Util.log(this.LOG_TAG, 'saveUser', userResponse);
    });
  }
}
