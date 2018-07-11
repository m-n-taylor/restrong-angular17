import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { QueryParams } from '../../shared/models/query-params';
import { UserAPIRequestData } from '../../shared/models/user-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'past-orders',
  templateUrl: './past-orders.component.html',
  providers: []
})
export class PastOrdersComponent {
  
  busy: boolean;
  pastOrders: Array<any>;

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, private userService: UserService) {
    this.universalInit();
  }

  universalInit() {
    Util.log('universalInit()');

    this.loadData();
  }

  ngOnInit() {

  }

  loadData = () => {

    this.busy = true;
    var requestData = new UserAPIRequestData();

    UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

    this.appService.getPastOrders(requestData).subscribe(response => {

      this.pastOrders = response;

      this.busy = false;

      Util.log('getPastOrders()', response);

    });
    
  }

  choosePastOrder = (pastOrder) => {
    
    this.router.navigate(['past-orders', pastOrder.ID]);

  }

}
