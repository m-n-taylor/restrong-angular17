import { Component, Input, Output, EventEmitter, ViewChild, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { Constants } from "../../shared/constants";
import { Util } from "../../shared/util";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { UserAPIRequestData } from "../../shared/models/user-api-request-data";
import { AppService } from "../../shared/services/app.service";
import { OrderItemsDetailsAPIRequestData } from "../../shared/models/order-items-details-api-request-data";
import { OrderDetailsAPIRequestData } from "../../shared/models/order-details-api-request-data";
import { OrderItem } from "../../shared/models/order-item";
import { UserService } from "../shared/services/user.service";
import { WriteReviewModalComponent } from '../shared/components/write-review-modal/write-review-modal.component';
import { ThankYouPointsModalComponent } from '../shared/components/thank-you-points-modal/thank-you-points-modal.component';
import { IChatThread } from '../../../../../shared/interface/IChatThread';
import { IChatMessage } from '../../../../../shared/interface/IChatMessage';
import { isPlatformBrowser } from '@angular/common';
import { ISocket } from '../../../../../shared/interface/ISocket';
import { ToastsManager } from 'ng2-toastr';

declare var io;

@Component({
    selector: 'profile-order-chat',
    templateUrl: './profile-order-chat.component.html',
})
export class ProfileOrderChatComponent {
    LOG_TAG = 'ChatComponent =>';

    isBrowser = false;

    private socket: ISocket;

    orderNumber = null;
    thread: IChatThread;
    messageText: string;
    notificationAudio = null;

    busy = false;
    busyText = null;

    // @ViewChild('chatTemplatesModal') chatTemplatesModal: ChatTemplatesModalComponent;
    @ViewChild('threadChatSection') threadChatSection: ElementRef;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute, public constants: Constants, private toastr: ToastsManager, private userService: UserService, public sharedDataService: SharedDataService) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        this.sharedDataService.hideSupportChatWindow = true;
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit()');

        if (this.isBrowser) {
            this.route.params.subscribe((params: any) => {
                this.orderNumber = params.id;

                if (Util.isDefined(this.orderNumber)) {
                    this.initPage();
                }
            });
        }
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()');

        this.busy = true;
        this.busyText = 'Our waiters are serving other customers. Please wait we will connect your shortly. Sorry for the delay.';

        this.socket = io(this.constants.SOCKET_SERVER_CHAT,
            {
                query: {
                    authCode: this.userService.loginUser.AuthCode,
                    userType: 'customer',
                    threadType: this.constants.CHAT_THREAD_TYPE_ORDERS,
                    orderNumber: this.orderNumber
                }
            });

        this.socket.on('error', (error) => {
            this.toastr.error('Unable to connect to chat at the moment. Please try later.', 'Error!');

            this.router.navigate(['/past-orders']);

            Util.log(this.LOG_TAG, 'connection error');
        });

        this.socket.on('connected', (data) => {
            this.thread = data.thread;

            this.socket.emit('get-thread-messages', { threadID: this.thread.ID });

            if (this.thread.UserID) {
                this.initChatComplete();
            }

            Util.log(this.LOG_TAG, 'connected to server', data);
        });

        this.socket.on('receive-message', (data: any) => {
            var message: IChatMessage = data.message;

            this.thread.messages = this.thread.messages || [];
            this.thread.messages.push(message);

            // If message recieved in current thread
            this._threadChatSectionScrollBottom();

            // If message came from user
            if (message.SenderType == 'user') {

                // Show Desktop notification
                Util.showDesktopNotification({
                    title: `${this.thread.UserName}`,
                    body: message.Message,
                })

                // Play Notification Tone
                if (this.notificationAudio) {
                    this.notificationAudio.pause();
                    this.notificationAudio.currentTime = 0;
                }

                this.notificationAudio = new Audio(`${this.constants.NOTIFICATION_TONE_DIR}/${this.constants.DEFAULT_NOTIFICATION_TONE}`);
                this.notificationAudio.play();
            }

            Util.log('receive-message', message);
        });

        this.socket.on('send-thread-messages', (data) => {
            if (this.thread && data.messages && data.messages.length > 0) {
                var message: IChatMessage = data.messages[0];

                if (this.thread.ID == message.ThreadID) {
                    this.thread.messages = data.messages;
                }
            }

            this._threadChatSectionScrollBottom();

            Util.log('send-thread-messages', data);
        });

        this.socket.on('thread-online-users', (data) => {
            this.thread.userOnline = data.user.online;

            Util.log('thread-online-users', data);
        });

        this.socket.on('user-assigned', (data) => {
            Util.merge(this.thread, data.thread);

            this.initChatComplete();

            Util.log('thread-online-users', data);
        });

        this.socket.on('thread-closed', (data) => {
            if (this.thread.ID == data.threadID) {
                this.disconnect();

                this.toastr.success('Chat session has been completed, If u have more questions you can contact us again.', 'Thanks!', { dismiss: 'click' });

                this.router.navigate(['/past-orders']);
            }
        });
    }

    /**
     * Init chat complete
     */
    initChatComplete = () => {
        this.busy = false;
        this.busyText = null;
    }

    sendMessage = () => {
        if (Util.isDefined(this.messageText) && this.messageText.trim().length > 0) {
            this.socket.emit('send-message', {
                message: this.messageText
            });

            this.messageText = '';

            this._threadChatSectionScrollBottom();
        }
    }

    disconnect = function () {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    closeThread = (thread: IChatThread) => {
        Util.log('closeThread', thread);

        this.socket.emit('close-thread', { threadID: thread.ID });
    }

    private _threadChatSectionScrollBottom = () => {
        setTimeout(() => {
            var element = this.threadChatSection.nativeElement;
            element.scrollTop = element.scrollHeight;
        }, 10);
    }

    openChatTemplatesModal = () => {
        // this.chatTemplatesModal.open({ messageTemplates: this.messageTemplates })
        //     .then((data: any) => {
        //         if (Util.isDefined(data) && Util.isDefined(data.messageTemplate)) {
        //             this.messageText = data.messageTemplate.Value;
        //         }
        //     });
    }

    goBack = () => {
        this.router.navigate(['/past-orders']);
    }

    ngOnDestroy() {
        Util.log(this.LOG_TAG, 'ngOnDestroy');

        if (this.socket) {
            this.socket.disconnect();
        }

        this.sharedDataService.hideSupportChatWindow = false;
    }
}