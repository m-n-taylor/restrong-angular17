import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';

@Component({
  selector: 'food-bytes',
  templateUrl: './food-bytes.component.html'
})
export class FoodBytesComponent implements OnInit {
  LOG_TAG = 'FoodBytesComponent';

  foodBytesList: any = [];

  busy = false;

  constructor(private ROService: ROService, private router: Router) { }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'ngOnInit()');

    this.loadData();
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.busy = true;

    this.ROService.getFoodBytesList().subscribe(response => {
      this.foodBytesList = response;

      for (var i in this.foodBytesList) {
        var item = this.foodBytesList[i];

        item.Title = item.Title.replace('FoodBytes: ', '');
      }

      this.busy = false;

      Util.log(this.LOG_TAG, 'getFoodBytesList', response);
    });
  }

  viewDetails = (item) => {
    this.router.navigate([`/${Path.RO.BASE}/${Path.RO.FOOD_BYTES}`, item.Id]);

    Util.log(this.LOG_TAG, 'viewDetails', item);
  }

}
