import { Component, Directive, ElementRef, Renderer, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Services
import { HttpClient } from '../shared/services/http.client';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';
import { AuthService } from "../shared/components/social-login/auth.service";

// Shared Components
import { ShoppingCartModalComponent } from '../shared/components/shopping-cart-modal/shopping-cart-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  selector: 'main',
  providers: [Constants, HttpClient, ShoppingCart, AuthService],
  templateUrl: './main.component.html'
})
export class MainComponent {
  @ViewChild('shoppingCartModal') public shoppingCartModal: ShoppingCartModalComponent;

  constructor(public userService: UserService, public shoppingCart: ShoppingCart, public _auth: AuthService) {
  }

  openShoppingCart = () => {
    this.shoppingCartModal.open();
  }

  logout = () => {
    if (Util.isDefined(this.userService.loginUser.sn_id)) {
      localStorage.removeItem('_login_provider');
    }
    this.userService.loginUser = null;
  }
}