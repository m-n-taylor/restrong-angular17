import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';

// RO Services
import { SharedDataService } from '../shared/services/shared-data.service';

@Component({
  selector: 'ro-support',
  templateUrl: './support.component.html'
})
export class SupportComponent implements OnInit {
  LOG_TAG = 'SupportComponent =>';

  constructor(private router: Router, public sharedDataService: SharedDataService) { }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'Init()');
  }

  toggleFAQ = (faq) => {
    faq.isOpen = !faq.isOpen;
  }
}