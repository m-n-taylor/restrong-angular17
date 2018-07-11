import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Services
import { ShoppingCart } from '../shared/services/shopping-cart.service';
import { AppService } from '../shared/services/app.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'new-page',
  templateUrl: './page.component.html',
  providers: []
})
export class PageComponent {
  
  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart) {
    
  }

  universalInit() {
    Util.log('universalInit()');

    this.loadData();
  }

  loadData = () => {
    
  }
}
