import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
import { EventsService } from '../../shared/services/events.service';
import { Util } from '../../shared/util';
import { ShoppingCart } from '../shared/services/shopping-cart.service';
import { FiltersService } from '../shared/services/filters.service';
import { AuthService } from '../../libs/social-login/auth.service';

@Component({
	selector: 'cr-main',
	template: `<div class='cr-app'><router-outlet></router-outlet></div>`,
	providers: [
		AuthService,
		ShoppingCart,
		FiltersService
	],
})
export class CRMainComponent implements OnInit {
	LOG_TAG = 'CRMainComponent';

	subscriptionAuthCodeExpiration: any;

	constructor(private eventsService: EventsService, private router: Router) {
		Util.log(this.LOG_TAG, 'constructor');
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit');

		this.subscriptionAuthCodeExpiration = this.eventsService.onAuthCodeExpired.subscribe((data) => {
			if (data.type == 'CR') {
				this.router.navigate([`/login`], { queryParams: { session: 'expired' } });
			}

			Util.log(this.LOG_TAG, 'onAuthCodeExpired', data);
		});
	}

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');

		if (this.subscriptionAuthCodeExpiration) {
			this.subscriptionAuthCodeExpiration.unsubscribe();
		}
	}
}