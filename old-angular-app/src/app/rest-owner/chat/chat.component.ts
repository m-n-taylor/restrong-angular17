import { Component, OnInit, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Interfaces
import { ISocket } from '../../../../../shared/interface/ISocket';
import { IChatThread } from '../../../../../shared/interface/IChatThread';
import { IChatMessage } from '../../../../../shared/interface/IChatMessage';

// RO Models
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { InputService } from '../../shared/services/input.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// RO Shared Components
import { ChatTemplatesModalComponent } from '../shared/components/chat-templates-modal/chat-templates-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as io from 'socket.io-client';

@Component({
    selector: 'ro-chat',
    templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
    LOG_TAG = 'ChatComponent =>';

    private socket: ISocket;

    threads = new Array<IChatThread>();
    selectedThread: IChatThread;
    selectedThreadActionsOpened = false;

    messageText: string;
    searchText: string;

    notificationAudio = null;

    messageTemplates = [];


    @ViewChild('chatTemplatesModal') chatTemplatesModal: ChatTemplatesModalComponent;
    @ViewChild('threadChatSection') threadChatSection: ElementRef;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private ROService: ROService, public input: InputService, public constants: Constants, private toastr: ToastsManager, private userService: UserService, public sharedDataService: SharedDataService) {
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit()');

        if (isPlatformBrowser(this.platformId)) {
            this.initPage();
        }
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()');

        var url = `${this.constants.SOCKET_SERVER}/orders-chat`;

        this.socket = io(url,
            {
                query: {
                    authCode: this.userService.loginUser.AuthCode,
                    userType: 'user'
                }
            });

        this.socket.on('error', (error) => {
            Util.log(this.LOG_TAG, 'connection error');
        });

        this.socket.on('connected', (data) => {
            this.threads = data.threads;

            Util.log(this.LOG_TAG, 'connected to server', data);
        });

        this.socket.on('new-thread', (data) => {
            this.threads.push(data.thread);

            Util.log(this.LOG_TAG, 'new-thread', data);
        });

        this.socket.on('receive-message', (data: any) => {
            var message: IChatMessage = data.message;
            var thread: IChatThread = null;

            if (this.selectedThread && this.selectedThread.ID == message.ThreadID) {
                thread = this.selectedThread;
            }
            else {
                var list = this.threads.filter(t => t.ID == message.ThreadID);

                if (list.length > 0) {
                    thread = list[0];
                }
            }

            if (thread) {
                thread.messages = thread.messages || [];
                thread.messages.push(message);

                // If message recieved in current thread
                if (this.selectedThread && thread.ID == this.selectedThread.ID) {
                    this._threadChatSectionScrollBottom();
                }
                else {
                    thread.count = thread.count || 0;
                    thread.count++;
                }

                // If message came from customer
                if (message.SenderType == 'customer') {

                    // Show Desktop notification
                    Util.showDesktopNotification({
                        title: `${thread.CustomerName} (${thread.OrderNumber})`,
                        body: message.Message,
                    })

                    // Play Notification Tone
                    if (this.notificationAudio) {
                        this.notificationAudio.pause();
                        this.notificationAudio.currentTime = 0;
                    }

                    if (Util.isDefined(this.userService.loginUser.NotificationTone)) {
                        this.notificationAudio = new Audio(`${this.constants.NOTIFICATION_TONE_DIR}/${this.userService.loginUser.NotificationTone}`);
                        this.notificationAudio.play();
                    }

                }
            }

            Util.log('receive-message', message);
        });

        this.socket.on('send-thread-messages', (data) => {
            if (this.selectedThread && data.messages && data.messages.length > 0) {
                var message: IChatMessage = data.messages[0];

                if (this.selectedThread.ID == message.ThreadID) {
                    this.selectedThread.messages = data.messages;
                }
            }

            Util.log('send-thread-messages', data);
        });

        this.socket.on('thread-online-users', (data) => {
            var threads = this.threads || [];

            var list = threads.filter(t => t.ID == data.threadID);

            if (list.length > 0) {
                var thread: IChatThread = list[0];

                thread.customerOnline = data.customer.online;
            }

            Util.log('thread-online-users', data);
        });

        this.socket.on('thread-closed', (data) => {
            var threadID = data.threadID;

            if (threadID == this.selectedThread.ID) {
                this.selectedThread = null;
            }

            var list = this.threads.filter(t => t.ID == threadID);

            if (list.length > 0) {
                var thread = list[0];
                var index = this.threads.indexOf(thread);
                this.threads.splice(index, 1);
            }
        });

        this.socket.on('send-message-templates', (data) => {
            Util.log('send-message-templates', data);

            this.messageTemplates = data.messageTemplates;
        });
    }

    toggleSelectedThreadActions = () => {
        this.selectedThreadActionsOpened = !this.selectedThreadActionsOpened;
    }

    chooseThread = (thread) => {
        this.selectedThread = thread;
        this.selectedThread.count = 0;

        this.socket.emit('get-thread-messages', { threadID: thread.ID });

        this._threadChatSectionScrollBottom();
    }

    unSelectThread = () => {
        this.selectedThread = null;
    }

    sendMessage = () => {
        this.socket.emit('send-message', {
            message: this.messageText,
            threadID: this.selectedThread.ID
        });

        this.messageText = '';

        this._threadChatSectionScrollBottom();
    }

    searchTextChange = () => {
        Util.log('searchTextChange', this.searchText);

        for (var i = 0; i < this.threads.length; i++) {
            var thread = this.threads[i];

            var customerName = thread.CustomerName.toLowerCase();
            var orderNumber = thread.OrderNumber.toLowerCase();
            var searchText = this.searchText.toLowerCase();

            if (customerName.indexOf(searchText) == -1 && orderNumber.indexOf(searchText) == -1) {
                thread.hidden = true;
            }
            else {
                thread.hidden = false;
            }
        }
    }

    closeThread = (thread: IChatThread) => {
        Util.log('closeThread', thread);

        this.socket.emit('close-thread', { threadID: thread.ID });
    }

    pageClick = () => {
        this.selectedThreadActionsOpened = false;
    }

    private _threadChatSectionScrollBottom = () => {
        setTimeout(() => {
            var element = this.threadChatSection.nativeElement;
            element.scrollTop = element.scrollHeight;
        }, 10);
    }

    openChatTemplatesModal = () => {
        this.chatTemplatesModal.open({ messageTemplates: this.messageTemplates })
            .then((data: any) => {
                if (Util.isDefined(data) && Util.isDefined(data.messageTemplate)) {
                    this.messageText = data.messageTemplate.Value;
                }
            });
    }

    ngOnDestroy() {
        Util.log(this.LOG_TAG, 'ngOnDestroy');

        if (this.socket) {
            this.socket.disconnect();
        }
    }
}