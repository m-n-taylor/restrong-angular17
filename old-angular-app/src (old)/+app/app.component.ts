import { Component, Directive, ElementRef, Renderer, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';

// Shared Helpers
import { Util } from './shared/util';
import { Constants } from './shared/constants';

// Shared Services
import { HttpClient } from './shared/services/http.client';
import { AppService } from './shared/services/app.service';
import { UserService } from './shared/services/user.service';
import { EventsService } from './shared/services/events.service';
import { BaseModal } from './shared/services/base-modal.service';
import { SharedDataService } from './shared/services/shared-data.service';
import { ShoppingCart } from './shared/services/shopping-cart.service';

// Shared Components
import { ShoppingCartModalComponent } from './shared/components/shopping-cart-modal/shopping-cart-modal.component';

import './scss/_app.scss';

//
/////////////////////////
// ** Example Directive
// Notice we don't touch the Element directly

@Directive({
  selector: '[xLarge]'
})
export class XLargeDirective {
  constructor(element: ElementRef, renderer: Renderer) {
    // ** IMPORTANT **
    // we must interact with the dom through -Renderer-
    // for webworker/server to see the changes
    renderer.setElementStyle(element.nativeElement, 'fontSize', 'x-large');
    // ^^
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  selector: 'body',
  providers: [Constants, HttpClient, AppService, ShoppingCart, EventsService, UserService, SharedDataService],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {

  constructor(element: ElementRef, renderer: Renderer, public constants: Constants, public shoppingCart: ShoppingCart, public eventsService: EventsService, public userService: UserService) {

    // Calls when a modal is opened
    this.eventsService.onModalStateChanged.subscribe((data) => {

      renderer.setElementClass(element.nativeElement, 'modal-open', data.state == BaseModal.STATE_OPENED);

    });

  }

}