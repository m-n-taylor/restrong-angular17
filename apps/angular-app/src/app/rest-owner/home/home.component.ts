import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

declare var Swiper;

@Component({
	selector: 'ro-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	LOG_TAG = 'HomeComponent';

	busy = false;

	isBrowser: boolean;

    //@ViewChild('videoPlayer') videoPlayer: any;
	constructor( @Inject(PLATFORM_ID) private platformId: Object, private ROService: ROService, public userService: UserService, public constants: Constants, private router: Router, private toastr: ToastsManager, public sharedDataService: SharedDataService) {
		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');

		if (this.isBrowser) {
			var swiper = new Swiper('.ro-home-swiper-container', {
				pagination: '.swiper-pagination',
				paginationClickable: true,
				nextButton: '.swiper-button-next',
				prevButton: '.swiper-button-prev',
				spaceBetween: 30,
				effect: 'fade',
				autoplay: 3000,
				fade: { crossFade: true },
				loop: true,
				autoHeight: true,
			});
		}
	}

	ngAfterViewInit() {
        Util.log(this.LOG_TAG, 'ngAfterViewInit');

        /*if (this.isBrowser) {
            var video = this.videoPlayer.nativeElement;

            var source = document.createElement('source');
            source.setAttribute('src', '/assets/videos/foodreel-v2.mp4');

            video.appendChild(source);
            video.play();
		}*/
    }

	requestDemo = () => {
		var element = document.getElementById('request-demo');

		var offset = 0;
		Util.scrollTo(document.documentElement, element.offsetTop - offset, 100);
	}
}
