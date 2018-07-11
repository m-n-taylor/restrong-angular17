import * as moment from 'moment';
import * as sql from 'mssql';

import { DB } from '../model/database.model';

import { Constants } from '../constants';
import { Util } from '../util';

import { Socket } from "../model/socket.model";
import { User } from '../model/user.model';
import { ChatMessage } from '../model/chat-message.model';
import { ChatThread } from '../model/chat-thread.model';
import { ChatThreadOrders } from '../model/chat-thread-orders.model';
import { OrdersChat } from '../model/orders-chat.model';
import { SupportChat } from '../model/support-chat.model';
import { Chat } from '../model/chat.model';

export class ChatController {
    LOG_TAG = 'ChatController';

    private chat: Chat;
    private ordersChat: OrdersChat;
    private supportChat: SupportChat;

    private db = new DB();
    private userSocketList = new Array<Socket>();
    private customerSocketList = new Array<Socket>();
    private restUserSocketList = new Array<Socket>();
    private guestSocketList = new Array<Socket>();
    private nps: any;
    private constants: Constants;

    constructor(io: any, constants: Constants) {
        this.constants = constants;

        this.nps = io.of('/chat');

        this.chat = new Chat(this.nps, this.constants, this.db, this.guestSocketList, this.customerSocketList, this.restUserSocketList, this.userSocketList);
        this.ordersChat = new OrdersChat(this.chat, this.nps, this.constants, this.db, this.guestSocketList, this.customerSocketList, this.restUserSocketList, this.userSocketList);
        this.supportChat = new SupportChat(this.chat, this.nps, this.constants, this.db, this.guestSocketList, this.customerSocketList, this.restUserSocketList, this.userSocketList);

        this.nps.use(this.useMiddleware)
            .on('connection', this.onConnection);
    }

    /**
     * Middleware
     */
    private useMiddleware = async (socket: Socket, next: any) => {
        var query = socket.handshake.query;

        Util.log(this.LOG_TAG, 'Socket middleware');

        var userType = query.userType;
        var isAuthenticated = false;
        var errorCode = null;

        // Common 
        if (userType == 'user') {
            try {
                isAuthenticated = await this.chat.authenticateUser(socket);
            }
            catch (e) {
                Util.log(this.LOG_TAG, 'authenticateUser Exception', e.message);

                isAuthenticated = false;
                errorCode = e.message;
            }

        }
        else {

            // If thread type is `Orders`
            if (query.threadType == this.constants.CHAT_THREAD_TYPE_ORDERS) {
                isAuthenticated = await this.ordersChat.useMiddleware(socket, next);
            }
            // If thread type is `Support`
            else if (query.threadType == this.constants.CHAT_THREAD_TYPE_SUPPORT) {
                try {
                    isAuthenticated = await this.supportChat.useMiddleware(socket, next);
                }
                catch (e) {
                    Util.log(this.LOG_TAG, 'supportChat.useMiddleware Exception', e.message);

                    isAuthenticated = false;
                    errorCode = e.message;
                }
            }
        }

        if (!isAuthenticated) {
            next(new Error(JSON.stringify({
                status: isAuthenticated,
                code: errorCode
            })));
        }
        else {
            next();
        }
    }

    /**
     * On Connection
     */
    private onConnection = async (socket: Socket) => {
        socket.joinedTimestamp = moment().unix();
        var threadType = socket.handshake.query.threadType;

        Util.log('Connected client.', socket.userType);

        // Common 
        if (socket.userType == 'user') {
            var threadsOrderResult = await this.db.findThreadsOrder({
                userID: socket.user.ID
            });

            var threadsSupportResult = await this.db.findThreadsSupport({
                userID: socket.user.ID
            });

            socket.threads = threadsOrderResult.recordset.concat(threadsSupportResult.recordset);
            this.chat.connectUser(socket);

            Util.log(this.LOG_TAG, 'User Threads', socket.threads.length);
        }
        else {

            // If thread type is `Orders`
            if (threadType == this.constants.CHAT_THREAD_TYPE_ORDERS) {
                await this.ordersChat.onConnection(socket);
            }
            // If thread type is `Support`
            else if (threadType == this.constants.CHAT_THREAD_TYPE_SUPPORT) {
                await this.supportChat.onConnection(socket);
            }

        }

        // TODO: Verify security, Also check if a user has `active` socket connection, can he call the `on` event, and send messages to some other threads

        socket
            .on('send-message', (data: any) => {
                this.chat.onSendMessage(socket, data);
            })
            .on('get-thread-messages', (data: any) => {
                this.chat.onGetThreadMessages(socket, data);
            })
            .on('close-thread', (data: any) => {
                this.chat.onCloseThread(socket, data);
            })
            .on('disconnect', () => {
                this.chat.onDisconnect(socket);
            });
    }
}