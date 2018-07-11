import { Component, Input } from '@angular/core';
import { Constants } from '../../constants';
import { Util } from '../../util';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
    selector: 'site-footer',
    templateUrl: './site-footer.component.html',
})
export class SiteFooterComponent {
    LOG_TAG = 'SiteFooterComponent';

    public get isPlatform(): boolean {
        return Util.isDefined(this.constants) && Util.isDefined(this.constants.PUBLIC_KEY) && this.constants.PUBLIC_KEY.length > 0;
    }

    logoImage = 'img/shared/brand-logo.svg';

    @Input() topBorder: boolean;
    @Input() config: any = {};

    section4Links = [];

    /**
     * constructor
     */
    constructor(private constants: Constants, public sharedDataService: SharedDataService) {
        Util.log(this.LOG_TAG, 'constructor', this.constants.PUBLIC_KEY);

        // this.constants.PUBLIC_KEY = '';

        if (this.isPlatform) {
            this.logoImage = this.sharedDataService.platformSettings.App_Icon;
        }

        this.section4Links = [
            {
                name: 'Login',
                link: this.isPlatform ? '/login' : '/backoffice/login'
            },
            {
                name: 'Register',
                link: this.isPlatform ? '/signup' : '/backoffice/signup'
            },
            {
                name: 'Terms and conditions',
                link: '/terms-of-use'
            }
        ];
    }
}