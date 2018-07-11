import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Models
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { InputService } from '../../shared/services/input.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { UserService } from '../shared/services/user.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'ro-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    LOG_TAG = 'SettingsComponent =>';

    password = {
        old: '',
        new: '',
    }

    busy = false;

    hasPassword = false;

    audio: HTMLAudioElement;
    selectedNotificationTone: any;
    notificationToneList = [];

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private ROService: ROService, public input: InputService, public constants: Constants, private toastr: ToastsManager, private userService: UserService, private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit()');

        if (isPlatformBrowser(this.platformId)) {
            this.initPage();
        }
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()');

        this.selectedNotificationTone = this.userService.loginUser.NotificationTone || '-1';
    }

    onNotificationToneChanged = () => {
        Util.log(this.LOG_TAG, 'onNotificationToneChanged()', this.selectedNotificationTone);

        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }

        this.audio = new Audio(`${this.constants.NOTIFICATION_TONE_DIR}/${this.selectedNotificationTone}`);
        this.audio.play();
    }

    onPasswordEnter = () => {
        Util.log(this.LOG_TAG, 'passwordTyped()', this.hasPassword);

        if ((Util.isDefined(this.password.old) && this.password.old.length > 0) || (Util.isDefined(this.password.new) && this.password.new.length > 0)) {
            this.hasPassword = true;
        }
        else {
            this.hasPassword = false;
        }

        this.changeDetectorRef.detectChanges();
    }

    save = (form) => {
        Util.log(this.LOG_TAG, 'save()', form, this.password);

        this.busy = true;

        var promiseList = [];

        // Settings
        var requestData = new ROAPIRequestData();
        requestData.notificationtone = this.selectedNotificationTone;

        promiseList.push(this.ROService.updateUserSettings(requestData));

        // Password
        if (this.hasPassword) {
            requestData = new ROAPIRequestData();
            requestData.op = this.password.old;
            requestData.np = this.password.new;

            promiseList.push(this.ROService.changePassword(requestData, { ignoreLogin: false }));
        }

        Observable.forkJoin(promiseList).subscribe((response: any) => {
            var successSettings = true;
            var successPassword = true;

            var settingsResponse = response[0];

            if (settingsResponse.Status == this.constants.STATUS_SUCCESS) {
            }
            else {
                successSettings = false;
            }

            if (this.hasPassword) {
                var passwordResponse = response[1];

                if (passwordResponse.Status == this.constants.STATUS_SUCCESS) {
                    this.password = {
                        old: '',
                        new: '',
                    };
                }
                else {
                    successPassword = false;
                }
            }

            if (successSettings && successPassword) {
                this.userService.setNotificationTone(this.selectedNotificationTone == '-1' ? null : this.selectedNotificationTone);

                this.toastr.success('Settings saved successfully', 'Success!');
            }
            else if (!successPassword) {
                form.controls.oldPassword.setErrors({ asyncInvalid: true });

                this.toastr.error('The password you entered is wrong.', 'Error!');
            }
            else if (!successSettings) {
                this.toastr.error('Unable to save settings at the moment.', 'Error!');
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'changePassword', response);
        });
    }
}