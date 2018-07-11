import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
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
import { ShoppingCart } from '../../shared/services/shopping-cart.service';
import { AuthService } from "../../shared/components/social-login/auth.service";

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'login',
  templateUrl: './login.component.html',
  providers: [AuthService]
})
export class LoginComponent {
  busy: boolean;
  errorMessage: string;

  queryParams: QueryParams;

  loginUser = new User();

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService, public _auth: AuthService) {
    Util.log('search constructor()', this.route.params);

    if (Constants.DEBUG) {
      this.loginUser.UserName = 'abuzerasif@gmail.com';
      this.loginUser.Password = 'test111';
    }

    this.queryParams = new QueryParams();

    this.route.queryParams
      .subscribe((params: any) => {

        QueryParams.fillParams(this.queryParams, params);

        Util.log('QueryParams', params);

        this.universalInit();

      });

  }

  universalInit() {
    Util.log('search universalInit()');
  }

  ngOnInit() {

  }

  login = (request?: LoginAPIRequestData) => {
    Util.log('login');

    this.busy = true;

    if (!Util.isDefined(request)) {
      request = new LoginAPIRequestData();

      LoginAPIRequestData.fillUser(request, this.loginUser);
    }

    request.act = LoginAPIRequestData.ACTION_LOGIN;

    this.appService.login(request).subscribe(response => {
      this.busy = false;

      if (response) {

        if (response.Code) {
          // in case of error
          this.errorMessage = response.Message;

          Util.log('login error', response);
        }
        else {
          // in case of success
          this.errorMessage = null;

          var user = response;

          if (Util.isDefined(request.sn_id)) {
            user.sn_id = request.sn_id;
          }

          this.userService.loginUser = user;

          var url = this.queryParams.returnUrl || '/';

          if (url == '/')
            this.router.navigate([url]);
          else {
            delete this.queryParams.returnUrl; // removes returnUrl from `QueryString`

            this.router.navigate([url], { queryParams: this.queryParams });
          }

          Util.log('user saved in session storage');
        }

      }

      Util.log('response', response);
    });
  }

  socialLogin = (socialNetwork) => {
    console.log('socialLogin()');

    this._auth.login(socialNetwork).subscribe(
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
}
