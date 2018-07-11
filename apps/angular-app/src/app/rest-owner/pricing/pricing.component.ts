import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
	selector: 'ro-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit {
	LOG_TAG = 'PricingComponent';

	busy = false;

	isBrowser: boolean;

	globalSettings: any = {};

	pricingMarketPlace: any = {};
	pricingPlatform: any = {};
	pricingCombo: any = {};
	activePricing: number;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, private ROService: ROService, public userService: UserService, public constants: Constants, private router: Router, private route: ActivatedRoute, private toastr: ToastsManager, public sharedDataService: SharedDataService) {
		Util.log(this.LOG_TAG, 'constructor()');

		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		this.route.params.subscribe((params: any) => {
			Util.log(this.LOG_TAG, 'params()', params);

			var found = false;

			if (Util.isDefined(params.type)) {
				var type = params.type;

				if (Util.isDefined(this.constants.PRICING_ID[type])) {
					this.activePricing = this.constants.PRICING_ID[type];
					found = true;
				}
			}

			if (!found) {
				this.changePricing(this.constants.PRICING_PLATFORM, false);
			}

			this.loadData();
		});

		Util.log(this.LOG_TAG, 'ngOnInit()');
	}

	loadData = () => {
		this.busy = true;

		this.ROService.getGlobalSettings().promise.subscribe((response: any) => {
			this.globalSettings = response;

			var pricing = this.globalSettings.Pricing;

			for (var i in pricing) {
				var item = pricing[i];

				if (item.ID == this.constants.PRICING_MARKETPLACE) {
					this.pricingMarketPlace = item;
				}

				if (item.ID == this.constants.PRICING_PLATFORM) {
					this.pricingPlatform = item;
				}

				if (item.ID == this.constants.PRICING_COMBO) {
					this.pricingCombo = item;
				}
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'getGlobalSettings()', response);
		});
	}

	changePricing = (pricing, navigate: boolean) => {
		if (navigate) {
			this.router.navigate(['/backoffice/pricing', this.constants.PRICING_TITLE[pricing]]);
		}
		else {
			this.activePricing = pricing;
		}
	}

	requestDemo = () => {
		var element = document.getElementById('request-demo');

		var offset = 0;
		Util.scrollTo(document.documentElement, element.offsetTop - offset, 100);
	}
}
