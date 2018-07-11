import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// RO Services
import { ROService } from '../../../rest-owner/shared/services/ro.service';

@Component({
  selector: 'terms-of-use',
  templateUrl: './terms-of-use.component.html'
})
export class TermsOfUseComponent implements OnInit {
  LOG_TAG = 'TermsOfUseComponent';

  busy = false;

  userTerms = '';

  constructor(private ROService: ROService) {
  }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'ngOnInit()');

    this.loadData();
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.ROService.getGlobalSettings().promise.subscribe((response: any) => {
      this.userTerms = response.UserTerms.Description;

      Util.log(this.LOG_TAG, 'getGlobalSettings()', response);
    });
  }
}