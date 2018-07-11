import { Component, ViewChild, PLATFORM_ID, Inject, ElementRef, Input, Optional } from '@angular/core';
import { Util } from '../../util';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from '../../constants';
import { ToastsManager } from 'ng2-toastr';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { InputService } from '../../services/input.service';
import { ISocket } from '../../../../../../shared/interface/ISocket';
import { IChatMessage } from '../../../../../../shared/interface/IChatMessage';
import { IChatThread } from '../../../../../../shared/interface/IChatThread';
import { UserService as CustomerUserService } from '../../../consumer/shared/services/user.service';
import { UserService as RestUserService } from '../../../rest-owner/shared/services/user.service';
import { BaseUserService } from '../../services/base.user.service';
import { SharedDataService as CRSharedDataService } from '../../services/shared-data.service';
import { SharedDataService as ROSharedDataService } from '../../../rest-owner/shared/services/shared-data.service';

declare var io;

@Component({
	selector: 'support-chat-box',
	templateUrl: './support-chat-box.component.html',
})
export class SupportChatBoxComponent {
	LOG_TAG = 'SupportChatBoxComponent';

	TYPE_CUSTOMER = 'TYPE_CUSTOMER';
	TYPE_RESTAURANT = 'TYPE_RESTAURANT';

	isBrowser = false;

	private socket: ISocket;

	minimize = true;
	thread: any; //IChatThread
	messageText: string;
	notificationAudio = null;

	guestInfo: any = {};

	showGuestForm = false;
	busy = false;
	busyText = null;

	public get userService() {
		return this.type == this.TYPE_CUSTOMER ? this.customerUserService : this.restUserService;
	}

	public get sharedDataService() {
		return this.type == this.TYPE_CUSTOMER ? this.CRSharedDataService : this.ROSharedDataService;
	}

	@Input() type: string;
	@Input() confirmModal: ConfirmModalComponent;
	@ViewChild('threadChatSection') threadChatSection: ElementRef;

	constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute, public constants: Constants, private toastr: ToastsManager, private customerUserService: CustomerUserService, private restUserService: RestUserService, public input: InputService, @Optional() private CRSharedDataService: CRSharedDataService, @Optional() private ROSharedDataService: ROSharedDataService) {
		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}

	openChat = () => {
		this.minimize = false;

		if (!this.thread) {

			if (this.userService.isLoggedIn) {
				this.initChat();
			}
			else {
				// if(Constants.DEBUG) {
				// 	this.guestInfo = {
				// 		name: 'test123',
				// 		email: 'test1@dishzilla.com'
				// 	};
				// }
				this.showGuestForm = true;
			}
		}
	}

	submitGuestForm = (form) => {
		if (form.valid) {
			this.showGuestForm = false;
			this.initChat();
		}
	}

	startChat = () => {
		this.initChat();
	}

	toggleMinimize = () => {
		this.minimize = !this.minimize;

		if (!this.minimize) {
			this._threadChatSectionScrollBottom();
		}
	}

	// closeChat = async () => {

	// }

	initChat = () => {
		Util.log(this.LOG_TAG, 'initPage()');

		this.busy = true;
		this.busyText = 'Our waiters are serving other customers. Please wait we will connect your shortly. Sorry for the delay.';

		var queryParams: any = {};
		queryParams.threadType = this.constants.CHAT_THREAD_TYPE_SUPPORT;

		if (this.userService.isLoggedIn) {
			queryParams.authCode = this.userService.loginUser.AuthCode;
			queryParams.userType = this.type == this.TYPE_CUSTOMER ? 'customer' : 'rest-user';
		}
		else {
			queryParams.name = this.guestInfo.name;
			queryParams.email = this.guestInfo.email;
			queryParams.phone = this.guestInfo.phone || null;
			queryParams.userType = 'guest';
			queryParams.publicKey = this.constants.PUBLIC_KEY;
		}

		Util.log(this.LOG_TAG, 'queryParams', queryParams);

		this.socket = io(this.constants.SOCKET_SERVER_CHAT,
			{
				query: queryParams
			});

		this.socket.on('error', (error) => {
			this.toastr.error('Unable to connect to chat at the moment. Please try later.', 'Error!');
			this.disconnect(true);

			Util.log(this.LOG_TAG, 'connection error', error);
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

			Util.log(this.LOG_TAG, 'receive-message', message);
		});

		this.socket.on('send-thread-messages', (data) => {
			if (this.thread && data.messages && data.messages.length > 0) {
				var message: IChatMessage = data.messages[0];

				if (this.thread.ID == message.ThreadID) {
					this.thread.messages = data.messages;
				}
			}

			this._threadChatSectionScrollBottom();

			Util.log(this.LOG_TAG, 'send-thread-messages', data);
		});

		this.socket.on('thread-online-users', (data) => {
			this.thread.userOnline = data.user.online;

			Util.log(this.LOG_TAG, 'thread-online-users', data);
		});

		this.socket.on('user-assigned', (data) => {
			Util.merge(this.thread, data.thread);

			this.initChatComplete();

			Util.log(this.LOG_TAG, 'thread-online-users', data);
		});

		this.socket.on('thread-closed', (data) => {
			if (this.thread.ID == data.threadID) {
				this.disconnect(true);

				this.toastr.success('Chat session has been completed, If u have more questions you can contact us again.', 'Thanks!');
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

	closeChatWindow = (event) => {
		event.stopPropagation();

		this.disconnect(!this.thread);
	}

	hideChatWindow = (event) => {
		event.stopPropagation();

		this.sharedDataService.hideSupportChatWindowUserSession = true;
	}

	disconnect = async (force?: boolean) => {
		var data = {
			message: 'Are you sure you want to disconnect chat session?'
		};

		var confirm = force;

		if (!force) {
			confirm = await this.confirmModal.open(data);
		}

		if (confirm) {
			this.minimize = true;

			if (this.socket) {
				this.socket.disconnect();
				this.socket = null;
			}

			this.thread = null;
			this.busy = false;
			this.busyText = null;
		}
	}

	closeThread = (thread: IChatThread) => {
		Util.log(this.LOG_TAG, 'closeThread', thread);

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

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');

		if (this.socket) {
			this.socket.disconnect();
		}
	}
}