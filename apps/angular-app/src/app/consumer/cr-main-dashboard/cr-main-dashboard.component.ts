import { Component, OnInit, ViewChild, NgZone } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';

// Shared Services
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../../shared/services/shared-data.service';

// import { RightSidebarAnimation } from "../../shared/animations/right-sidebar.animation";
import { ShoppingCart } from "../shared/services/shopping-cart.service";
import { FiltersService } from "../shared/services/filters.service";
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'menus-app',
	templateUrl: './cr-main-dashboard.component.html',
	// animations: [RightSidebarAnimation],
})
export class CRMainDashboardComponent implements OnInit {
	LOG_TAG = 'CRMainDashboardComponent';

	isOpenProfileDropdown = false;
	cartIcon = null;

	@ViewChild('confirmModal') confirmModal: ConfirmModalComponent;
	
	constructor(public sharedDataService: SharedDataService, public userService: UserService, private zone: NgZone, public shoppingCart: ShoppingCart, public filtersService: FiltersService, private router: Router, private sanitizer: DomSanitizer) {
		this.cartIcon = this.sanitizer.bypassSecurityTrustUrl(Util.getShoppingCartIcon(this.sharedDataService.platformSettings.Color_Balanced, '36px'));
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		this.filtersService.setConfirmModal(this.confirmModal);
	}

	toggleProfileDropdown = () => {
		this.isOpenProfileDropdown = !this.isOpenProfileDropdown;

		Util.log(this.LOG_TAG, 'toggleProfileDropdown()', this.isOpenProfileDropdown);
	}

	clickOutsideProfileDropdown = (event: Event) => {
		event.stopPropagation();
		// event.stopPropagation();

		if (this.isOpenProfileDropdown) {
			this.toggleProfileDropdown();
		}

		// Util.log(this.LOG_TAG, 'clickOutsideProfileDropdown()', this.isOpenProfileDropdown);
	}

	closeMobileMenuIfOpen = () => {
		if (this.sharedDataService.isMobileMenuOpen) {
			this.sharedDataService.toggleMobileMenu();
		}
	}

	logout = () => {
		if (this.isOpenProfileDropdown) {
			this.toggleProfileDropdown();
		}

		if (Util.isDefined(this.userService.loginUser) && Util.isDefined(this.userService.loginUser.sn_id)) {
			localStorage.removeItem('_login_provider');
			// this.authService.signOut();
		}

		this.zone.run(() => {
			this.userService.loginUser = null;

			this.router.navigate(['/login']);
		});
	}

	ngOnDestroy = () => {
		Util.log(this.LOG_TAG, 'ngOnDestroy()');
	}
}