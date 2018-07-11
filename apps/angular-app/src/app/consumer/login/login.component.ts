import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { User } from '../../shared/models/user';
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';

// CR Shared Models
import { LoginAPIRequestData } from '../shared/models/login-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { InputService } from "../../shared/services/input.service";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { isPlatformBrowser } from '@angular/common';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AuthService } from '../../libs/social-login/auth.service';

// import { AuthService } from "angularx-social-login";
// import { FacebookLoginProvider, GoogleLoginProvider, LinkedInLoginProvider } from "angularx-social-login";

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
	providers: [AuthService]
})
export class LoginComponent {
	LOG_TAG = 'LoginComponent';

	PROVIDER_FACEBOOK = 'facebook';
	PROVIDER_GOOGLE = 'google';

	isBrowser = false;

	routeSubscription = null;
	authStateSubscription = null;

	busy: boolean;
	showPassword = false;

	queryParams = new QueryParams();

	loginUser = new User();

	constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService, public authService: AuthService, public input: InputService, private toastr: ToastsManager, public sharedDataService: SharedDataService, private zone: NgZone) {
		Util.log(this.LOG_TAG, 'search constructor()', this.route.params);

		this.isBrowser = isPlatformBrowser(this.platformId);

		if (Constants.DEBUG) {
			this.loginUser.UserName = 'abuzerasif@gmail.com';
			this.loginUser.Password = 'test111';
		}
	}

	ngOnInit() {
		this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
			QueryParams.fillParams(this.queryParams, params);

			if (Util.isDefined(params.session) && params.session == 'expired') {
				this.toastr.warning('Please login again', 'Session expired!');

				if (this.isBrowser) {
					this.userService.loginUser = null;
				}
			}

			Util.log(this.LOG_TAG, 'QueryParams', params);
		});
	}

	toggleShowPassword = () => {
		this.showPassword = !this.showPassword;
	}

	login = (request?: LoginAPIRequestData) => {
		Util.log(this.LOG_TAG, 'login');

		this.busy = true;

		if (!Util.isDefined(request)) {
			request = new LoginAPIRequestData();

			LoginAPIRequestData.fillUser(request, this.loginUser);
		}

		request.act = LoginAPIRequestData.ACTION_LOGIN;

		this.appService.login(request).subscribe(response => {
			this.zone.run(() => {
				this.busy = false;

				if (Util.isDefined(response.Code) && response.Code == 'INVALID_USER') {
					this.toastr.error('Invalid Username/password', 'Error!');
				}
				else {
					// in case of success
					var user = response;

					if (Util.isDefined(request.sn_id)) {
						user.sn_id = request.sn_id;
					}

					this.userService.loginUser = user;

					var url = this.queryParams.returnUrl || '/';
					delete this.queryParams.returnUrl; // removes returnUrl from `QueryString`

					if (url == 'checkout') {
						this.router.navigate(['/checkout'], { queryParams: this.queryParams });
					}
					else {
						this.router.navigate(['/']);
					}

					Util.log(this.LOG_TAG, 'user saved in session storage');
				}

				Util.log(this.LOG_TAG, 'response', response);
			});
		});
	}

	socialLogin = async (socialNetwork) => {
		console.log('socialLogin()');

		this.busy = true;

		// this.authService.signOut();

		// var providerID = null;

		// if (socialNetwork == this.PROVIDER_GOOGLE) {
		// 	providerID = GoogleLoginProvider.PROVIDER_ID;
		// }
		// else if (socialNetwork == this.PROVIDER_FACEBOOK) {
		// 	providerID = FacebookLoginProvider.PROVIDER_ID;
		// }

		// if (providerID) {
		// 	await this.authService.signIn(providerID);
		// }

		// this.authStateSubscription = this.authService.authState.subscribe((user) => {
		// 	if (user) {
		// 		var request = new LoginAPIRequestData();
		// 		request.access_token = user.authToken;

		// 		if (user.provider == this.PROVIDER_FACEBOOK) {
		// 			request.sn_id = LoginAPIRequestData.SOCIAL_LOGIN_FACEBOOK;
		// 		}

		// 		else if (user.provider == this.PROVIDER_GOOGLE) {
		// 			request.sn_id = LoginAPIRequestData.SOCIAL_LOGIN_GOOGLE;
		// 		}

		// 		this.login(request);
		// 	}

		// 	Util.log(this.LOG_TAG, 'authService => user', user);
		// });

		// var providerID = null;

		// if (socialNetwork == this.PROVIDER_GOOGLE) {
		// 	providerID = GoogleLoginProvider.PROVIDER_ID;
		// }
		// else if (socialNetwork == this.PROVIDER_FACEBOOK) {
		// 	providerID = FacebookLoginProvider.PROVIDER_ID;
		// }

		this.authService.login(socialNetwork).subscribe(
			(data: any) => {
				if (Util.isDefined(data) && Util.isDefined(data.provider)) {
					var request = new LoginAPIRequestData();
					request.access_token = data.token;

					if (data.provider == 'facebook') {
						request.sn_id = LoginAPIRequestData.SOCIAL_LOGIN_FACEBOOK;
					}
					else if (data.provider == 'google') {
						request.sn_id = LoginAPIRequestData.SOCIAL_LOGIN_GOOGLE;
					}

					this.login(request);
				}

				console.log('user login => ', data);
				//user data 
				//name, image, uid, provider, uid, email, token (returns tokenId for google, accessToken for Facebook, no token for linkedIn) 
			},
			(error) => {
				console.log('error social login => ', error);
			}
		)
	}

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');

		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}

		if (this.authStateSubscription) {
			this.authStateSubscription.unsubscribe();
		}
	}
}
