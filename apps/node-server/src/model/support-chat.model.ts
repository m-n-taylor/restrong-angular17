import * as sql from 'mssql';

import { Util } from "../util";
import { Socket } from "./socket.model";
import { DB } from "./Database.model";
import { User } from "./user.model";
import { Chat } from "./chat.model";
import { Constants } from "../constants";
import { ChatMessage } from "./chat-message.model";
import { Guest } from './guest.model';

export class SupportChat {
    LOG_TAG = 'SupportChat';

    /**
     * constructor
     */
    constructor(private chat: Chat, private nps: any, private constants: Constants, private db: DB, private guestSocketList: Array<Socket>, private customerSocketList: Array<Socket>, private restUserSocketList: Array<Socket>, private userSocketList: Array<Socket>) {

    }

    /**
     * Middleware Thread Type Orders
     */
    public useMiddleware = async (socket: Socket, next: any) => {
        var query = socket.handshake.query;
        var userType = query.userType;

        Util.log(this.LOG_TAG, 'useMiddleware', userType);

        var isAuthenticated = false;

        // if userType `guest`

        if (userType == 'guest') {
            isAuthenticated = await this.chat.authenticateGuest(socket);
        }

        else if (userType == 'customer') {
            isAuthenticated = await this.chat.authenticateCustomer(socket);
        }

        else if (userType == 'rest-user') {
            isAuthenticated = await this.chat.authenticateUser(socket);
        }

        return isAuthenticated;
    }

    /**
     * On Connection
     */
    public onConnection = async (socket: Socket) => {
        Util.log(this.LOG_TAG, 'onConnection', socket.userType);

        // if userType `guest`

        if (socket.userType == 'guest') {
            var user = <Guest>socket.user;

            var supportDataResult = await this.db.createChatThreadsSupportData({
                GuestID: user.GuestID,
                GuestName: user.FirstName,
                GuestEmail: user.Email,
                GuestPhone: user.Phone,
            });

            if (supportDataResult.recordset.length > 0) {
                var typeDataID = supportDataResult.recordset[0].ID;

                var chatThreadResult = await this.db.createChatThread(this.constants.CHAT_THREAD_TYPE_SUPPORT, typeDataID);

                if (chatThreadResult.recordset.length > 0) {
                    var threadID = chatThreadResult.recordset[0].ID;

                    var threadsResult = await this.db.findThreadsSupport({
                        ID: threadID
                    });

                    socket.thread = threadsResult.recordset[0];
                    this.chat.connectGuest(socket);

                    Util.log('New Thread Created', threadsResult.recordset);
                }
            }

            Util.log(this.LOG_TAG, 'orderDataResult');
        }

        else if (socket.userType == 'customer') {

            // var threadsResult = await this.db.findThreadsSupport({
            //     customerID: socket.user.ID
            // });

            // // If thread exists
            // if (threadsResult.recordset.length > 0) {
            //     socket.thread = threadsResult.recordset[0];
            //     this.chat.connectCustomer(socket);

            //     Util.log(this.LOG_TAG, 'Thread Already Exist', threadsResult.recordset);
            // }
            // else {
            // If thread DONT exists
            // Util.log(this.LOG_TAG, 'Thread NOT Exist', threadsResult.recordset);

            var supportDataResult = await this.db.createChatThreadsSupportData({
                customerID: socket.user.ID
            });

            if (supportDataResult.recordset.length > 0) {
                var typeDataID = supportDataResult.recordset[0].ID;

                var chatThreadResult = await this.db.createChatThread(this.constants.CHAT_THREAD_TYPE_SUPPORT, typeDataID);

                if (chatThreadResult.recordset.length > 0) {
                    var threadID = chatThreadResult.recordset[0].ID;

                    var threadsResult = await this.db.findThreadsSupport({
                        ID: threadID
                    });

                    socket.thread = threadsResult.recordset[0];
                    this.chat.connectCustomer(socket);

                    Util.log('New Thread Created', threadsResult.recordset);
                }
            }
            // }

            Util.log(this.LOG_TAG, 'orderDataResult');
        }

        else if (socket.userType == 'rest-user') {

            var supportDataResult = await this.db.createChatThreadsSupportData({
                restUserID: socket.user.ID
            });

            if (supportDataResult.recordset.length > 0) {
                var typeDataID = supportDataResult.recordset[0].ID;

                var chatThreadResult = await this.db.createChatThread(this.constants.CHAT_THREAD_TYPE_SUPPORT, typeDataID);

                if (chatThreadResult.recordset.length > 0) {
                    var threadID = chatThreadResult.recordset[0].ID;

                    var threadsResult = await this.db.findThreadsSupport({
                        ID: threadID
                    });

                    socket.thread = threadsResult.recordset[0];
                    this.chat.connectRestUser(socket);

                    Util.log('New Thread Created', threadsResult.recordset);
                }
            }

            Util.log(this.LOG_TAG, 'orderDataResult');
        }
    }
}