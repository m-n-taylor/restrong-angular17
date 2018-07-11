import { Component, OnInit, ViewChild, NgZone } from '@angular/core'

// Shared Helpers
import { Util } from '../../shared/util';

// Shared Services
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../../shared/services/shopping-cart.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AuthService } from '../../shared/components/social-login/auth.service';

import { ShoppingCartModalComponent } from '../../shared/components/shopping-cart-modal/shopping-cart-modal.component';

// import './menus-logo.png';

@Component({
  selector: 'menus-app',
  templateUrl: './cr-main-dashboard.component.html',
  providers: [AuthService],
})
export class CRMainDashboardComponent implements OnInit {
  @ViewChild('shoppingCartModal') public shoppingCartModal: ShoppingCartModalComponent;

  constructor(public sharedDataService: SharedDataService, public userService: UserService, public shoppingCart: ShoppingCart, public _auth: AuthService, private zone: NgZone) {

  }
  
  ngOnInit() {
    console.log('CRMainDashboardComponent => Init()');
  }

  openShoppingCart = () => {
    this.shoppingCartModal.open();
  }

  logout = () => {
    if (Util.isDefined(this.userService.loginUser) && Util.isDefined(this.userService.loginUser.sn_id)) {
      localStorage.removeItem('_login_provider');
    }

    this.zone.run(() => {
      this.userService.loginUser = null;
    });
    
  }

  // loadImage = (img) => {
  //   console.log('CRMainDashboardComponent => loadImage()12');
  //   return require('~/images/logo.png');
  // }
}