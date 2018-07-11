import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from "@angular/router";
import { Constants } from "../../shared/constants";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { Util } from "../../shared/util";
import { UserAPIRequestData } from "../../shared/models/user-api-request-data";
import { AppService } from "../../shared/services/app.service";
import { UserService } from "../shared/services/user.service";
import { UserAddress } from "../../shared/models/user-address";
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { UserAddressAPIRequestData } from "../../shared/models/user-address-api-request-data";
import { APIRequestData } from "../../shared/models/api-request-data";
import { SoldOutActionAPIRequestData } from "../../shared/models/soldout-action-api-request-data";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { InputService } from "../../shared/services/input.service";
import { ChangePasswordAPIRequestData } from "../../shared/models/change-password-api-request-data";
import { ChangePassword } from "../../shared/models/change-password";

@Component({
    selector: 'my-points',
    templateUrl: './my-points.component.html',
})
export class MyPointsComponent {
    LOG_TAG = 'MyPointsComponent';

    busy = false;

    constructor(public constants: Constants, public sharedDataService: SharedDataService, public userService: UserService, public appService: AppService, private router: Router, private toastr: ToastsManager, private changeDetectorRef: ChangeDetectorRef, public input: InputService) {
        
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.userService);
    }
}