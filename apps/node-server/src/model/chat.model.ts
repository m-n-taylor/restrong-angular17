import * as moment from 'moment';
import * as sql from 'mssql';
import * as crypto from 'crypto';

import { Socket } from "./socket.model";
import { Util } from "../util";
import { DB } from "./Database.model";
import { Constants } from '../constants';
import { ChatThread } from './chat-thread.model';
import { ChatMessage } from './chat-message.model';
import { ChatThreadOrders } from './chat-thread-orders.model';
import { User } from './user.model';
import { ChatThreadSupport } from './chat-thread-support.model';
import { Guest } from './guest.model';

export class Chat {
    LOG_TAG = 'SupportChat';

    private isAssigningToUser = false;

    /**
     * constructor
     */
    constructor(private nps: any, private constants: Constants, private db: DB, private guestSocketList: Array<Socket>, private customerSocketList: Array<Socket>, private restUserSocketList: Array<Socket>, private userSocketList: Array<Socket>) {
        Util.log(this.LOG_TAG, 'constructor');
    }

    // Authenticate Guest
    public authenticateGuest = async (socket: Socket) => {
        Util.log(this.LOG_TAG, 'authenticateCustomer');

        var query = socket.handshake.query;
        var isAuthenticated = false;

        if (Util.isDefined(query.name) && !Util.isEmpty(query.name) && Util.isDefined(query.email) && Util.isEmail(query.email)) {
            var findPlatformCompanyOptions: any = {};

            // Platform
            if (Util.isDefined(query.publicKey) && !Util.isEmpty(query.publicKey)) {
                findPlatformCompanyOptions.publicKey = query.publicKey;
            }

            // MarketPlace
            else {
                findPlatformCompanyOptions.ID = 0;
            }

            Util.log('findPlatformCompanyOptions', findPlatformCompanyOptions);

            var platformCompanyResult = await this.db.findPlatformCompany(['ID', 'EnableGuestSupportChat', 'EnableLoggedInSupportChat'], findPlatformCompanyOptions);

            if (platformCompanyResult.recordset.length > 0) {
                var platformCompany = platformCompanyResult.recordset[0];

                if (platformCompany.EnableGuestSupportChat) {
                    Util.log('platfromCompanyResult', platformCompany);

                    var user = new Guest();
                    user.GuestID = crypto.randomBytes(16).toString('hex');
                    user.FirstName = query.name;
                    user.Email = query.email;
                    user.Phone = query.phone || null;
                    user.PlatformCompanyID = platformCompany.ID;

                    socket.userType = query.userType;
                    socket.user = user;

                    isAuthenticated = true;
                }

                Util.log(this.LOG_TAG, 'platformCompany', platformCompany);
            }
        }

        return isAuthenticated;
    }

    // Authenticate Customer
    public authenticateCustomer = async (socket: Socket) => {
        Util.log(this.LOG_TAG, 'authenticateCustomer');

        var query = socket.handshake.query;
        var userType = query.userType;
        var authCode = query.authCode;

        var isAuthenticated = false;
        var customerResult = await this.db.findCustomerByAuthCode(authCode);

        Util.log(this.LOG_TAG, 'middlewareThreadTypeOrders', 'customerResult', customerResult);

        if (customerResult.recordset.length > 0) {
            socket.userType = userType;
            socket.user = customerResult.recordset[0];

            Util.log(this.LOG_TAG, 'PlatformCompanyID', socket.user.PlatformCompanyID);

            var platformCompanyResult = await this.db.findPlatformCompany(['EnableGuestSupportChat', 'EnableLoggedInSupportChat'], {
                ID: socket.user.PlatformCompanyID
            });

            Util.log(this.LOG_TAG, 'platformCompanyResult', platformCompanyResult);

            if (platformCompanyResult.recordset.length > 0) {
                var platformCompany = platformCompanyResult.recordset[0];

                if (platformCompany.EnableLoggedInSupportChat) {
                    isAuthenticated = true;
                }

                Util.log(this.LOG_TAG, 'platformCompany', platformCompany);
            }

            Util.log(this.LOG_TAG, 'findCustomerByAuthCode');
        }

        return isAuthenticated;
    }

    // Authenticate User
    public authenticateUser = async (socket: Socket) => {
        Util.log(this.LOG_TAG, 'authenticateUser');

        var query = socket.handshake.query;
        var userType = query.userType;
        var authCode = query.authCode;

        var isAuthenticated = false;

        var userResult = await this.db.findUserByAuthCode(authCode);

        if (userResult.recordset.length > 0) {
            socket.userType = userType;
            socket.user = userResult.recordset[0];

            var userRestDataResult = await this.db.findUserRestData(socket.user.ID);

            if (userRestDataResult.recordset.length > 0) {
                var userRestaurantData = userRestDataResult.recordset[0];

                if (userType == 'user') {
                    socket.user.PlatformCompanyID = userRestaurantData.PlatformCompanyID;
                }
                else if (userType == 'rest-user') {
                    socket.user.PlatformCompanyID = 0;
                }

                Util.log(this.LOG_TAG, 'PlatformCompanyID', socket.user.PlatformCompanyID);

                var platformCompanyResult = await this.db.findPlatformCompany(['EnableGuestSupportChat', 'EnableLoggedInSupportChat'], {
                    ID: socket.user.PlatformCompanyID
                });

                Util.log(this.LOG_TAG, 'platformCompanyResult', platformCompanyResult);

                if (platformCompanyResult.recordset.length > 0) {
                    var platformCompany = platformCompanyResult.recordset[0];

                    if (userType == 'user') {
                        if (platformCompany.EnableGuestSupportChat || platformCompany.EnableLoggedInSupportChat) {
                            isAuthenticated = true;
                        }
                    }
                    else if (userType == 'rest-user') {
                        if (platformCompany.EnableLoggedInSupportChat) {
                            isAuthenticated = true;
                        }
                    }

                    Util.log(this.LOG_TAG, 'platformCompany', platformCompany);
                }
            }
            else {
                throw new Error('USER_COMPANY_NOT_FOUND');
            }

            Util.log(this.LOG_TAG, 'findUserByAuthCode');
        }
        else {
            throw new Error('USER_NOT_FOUND');
        }

        Util.log(this.LOG_TAG, 'isAuthenticated', isAuthenticated);

        return isAuthenticated;
    }

    // On Send Message
    public onSendMessage = (socket: Socket, data: any) => {
        Util.log(this.LOG_TAG, 'onSendMessage');

        if (socket.userType == 'customer' || socket.userType == 'guest' || socket.userType == 'rest-user') {
            if (this.hasJoinedRoom(socket, socket.thread.ID)) {
                var message = new ChatMessage();
                message.Message = data.message;
                message.ThreadID = socket.thread.ID;
                message.SenderType = socket.userType;

                this.sendMessageToThread(socket, socket.thread, message);
            }
        }
        else if (socket.userType == 'user') {
            var threadID = data.threadID;

            var items = socket.threads.filter(t => t.ID == threadID);

            if (this.hasJoinedRoom(socket, threadID) && items.length > 0) {
                var thread = items[0];

                var message = new ChatMessage();
                message.ID = 0;
                message.Message = data.message;
                message.ThreadID = thread.ID;
                message.SenderType = socket.userType;

                this.sendMessageToThread(socket, thread, message);
            }
        }
    }

    // On Get thread messages
    onGetThreadMessages = (socket: Socket, data: any) => {
        Util.log(this.LOG_TAG, 'onGetThreadMessages');

        var threadID = data.threadID;

        if (this.hasJoinedRoom(socket, threadID)) {

            this.db.findChatMessagesByThreadID(threadID).then((result) => {
                socket.emit('send-thread-messages', { messages: result.recordset });
            });

        }
    }

    // On Close thread
    public onCloseThread = async (socket: Socket, data: any) => {
        Util.log(this.LOG_TAG, 'onCloseThread');

        var threadID = data.threadID;

        // TODO: When user closes the thread, make sure to kick out customer/guest from room

        if (socket.userType == 'user' && this.hasJoinedRoom(socket, threadID)) {
            var threads = socket.threads || [];
            var list = threads.filter(t => t.ID == threadID);

            if (list.length > 0) {
                var thread = list[0];
                var index = threads.indexOf(thread);

                if (index > -1) {
                    threads.splice(index, 1);

                    await this.db.closeThread(threadID);

                    this.nps.to(`thread-${threadID}`).emit('thread-closed', { threadID: threadID });

                    // Customer
                    if (thread.CustomerID) {
                        var customerSocketList = this.customerSocketList.filter(c => c.user.ID == thread.CustomerID);

                        if (customerSocketList.length > 0) {
                            var customerSocket = customerSocketList[0];
                            var customerSocketIndex = this.customerSocketList.indexOf(customerSocket);

                            this.customerSocketList.splice(customerSocketIndex, 1);

                            customerSocket.leave(`thread-${threadID}`);

                            customerSocket.disconnect();
                        }
                    }

                    // Guest
                    else if (thread.GuestID) {
                        var guestSocketList = this.guestSocketList.filter(c => (<Guest>c.user).GuestID == thread.GuestID);

                        if (guestSocketList.length > 0) {
                            var guestSocket = guestSocketList[0];
                            var guestSocketIndex = this.guestSocketList.indexOf(guestSocket);

                            this.guestSocketList.splice(guestSocketIndex, 1);

                            guestSocket.leave(`thread-${threadID}`);

                            guestSocket.disconnect();
                        }
                    }

                    // Rest User
                    else if (thread.RestUserID) {
                        var restUserSocketList = this.restUserSocketList.filter(c => c.user.ID == thread.RestUserID);

                        if (restUserSocketList.length > 0) {
                            var restUserSocket = restUserSocketList[0];
                            var restUserSocketIndex = this.restUserSocketList.indexOf(restUserSocket);

                            this.restUserSocketList.splice(restUserSocketIndex, 1);

                            restUserSocket.leave(`thread-${threadID}`);

                            restUserSocket.disconnect();
                        }
                    }

                    socket.leave(`thread-${threadID}`);

                    this.assignChatsToUser();
                }
            }
        }
    }

    // On Disconnect
    public onDisconnect = (socket: Socket) => {
        Util.log(this.LOG_TAG, 'onDisconnect', socket.userType);

        if (socket.userType == 'guest') {
            var index = this.guestSocketList.indexOf(socket);

            if (index > -1) {
                this.guestSocketList.splice(index, 1);

                this.emitThreadOnlineUsers(socket.thread);
            }
        }
        // When `customer` of `user` disconnects then remove them from `list` and from `rooms`
        else if (socket.userType == 'customer') {
            var index = this.customerSocketList.indexOf(socket);

            if (index > -1) {
                this.customerSocketList.splice(index, 1);

                this.emitThreadOnlineUsers(socket.thread);
            }
        }
        // When `rest-user` of `user` disconnects then remove them from `list` and from `rooms`
        else if (socket.userType == 'rest-user') {
            var index = this.restUserSocketList.indexOf(socket);

            if (index > -1) {
                this.restUserSocketList.splice(index, 1);

                this.emitThreadOnlineUsers(socket.thread);
            }
        }
        else if (socket.userType == 'user') {
            var index = this.userSocketList.indexOf(socket);

            if (index > -1) {
                this.userSocketList.splice(index, 1);

                var threads = socket.threads || [];

                for (var i = 0; i < threads.length; i++) {
                    var thread = threads[i];

                    this.emitThreadOnlineUsers(thread);
                }
            }
        }

        this.assignChatsToUser();

        Util.log(this.LOG_TAG, 'disconnect', socket.rooms);
    }

    // Connect Guest
    public connectGuest = (socket: Socket) => {
        Util.log(this.LOG_TAG, 'connectGuest', socket.thread);

        socket.join(`thread-${socket.thread.ID}`);

        this.guestSocketList.push(socket);

        socket.emit('connected', { thread: socket.thread });

        this.assignChatsToUser();

        this.emitThreadOnlineUsers(socket.thread);
    }

    // Connect Customer
    public connectCustomer = (socket: Socket) => {
        Util.log(this.LOG_TAG, 'connectCustomer', socket.thread);

        socket.join(`thread-${socket.thread.ID}`);

        this.customerSocketList.push(socket);

        socket.emit('connected', { thread: socket.thread });

        this.assignChatsToUser();

        this.emitThreadOnlineUsers(socket.thread);
    }

    // Connect Rest User
    public connectRestUser = (socket: Socket) => {
        Util.log(this.LOG_TAG, 'connectRestUser', socket.thread);

        socket.join(`thread-${socket.thread.ID}`);

        this.restUserSocketList.push(socket);

        socket.emit('connected', { thread: socket.thread });

        this.assignChatsToUser();

        this.emitThreadOnlineUsers(socket.thread);
    }

    // Connect User
    public connectUser = (socket: Socket) => {
        Util.log(this.LOG_TAG, '_connectUser');

        socket.lastMessageSent = moment().utc().format();

        for (var i = 0; i < socket.threads.length; i++) {
            var thread = socket.threads[i];

            socket.join(`thread-${thread.ID}`);
        }

        this.userSocketList.push(socket);

        socket.emit('connected', { threads: socket.threads });

        this.assignChatsToUser();

        for (var i = 0; i < socket.threads.length; i++) {
            var thread = socket.threads[i];

            this.emitThreadOnlineUsers(thread);
        }

        this.emitMessageTemplates(socket);
    }

    // TODO: Verify security that whether some one can send message to a thread without joining it, that means user can have a `active socket connection, but can try to send message to another thread.

    // Send Message to All users of Thread
    public sendMessageToThread = (senderSocket: Socket, thread: ChatThread, message: ChatMessage) => {
        var sentTime = moment().utc().format();

        senderSocket.lastMessageSent = sentTime;
        message.DateCreated = sentTime;

        if (senderSocket.userType == 'user') {

            var messageText = message.Message;

            if (thread.Type == this.constants.CHAT_THREAD_TYPE_ORDERS) {
                var chatThreadOrders = <ChatThreadOrders>thread;

                // Check if message has `CustomerName` placeholder
                if (messageText.indexOf('${CustomerName}') > -1) {
                    messageText = messageText.replace('${CustomerName}', chatThreadOrders.CustomerName);
                }

                // Check if message has `UserName` placeholder
                if (messageText.indexOf('${UserName}') > -1) {
                    messageText = messageText.replace('${UserName}', chatThreadOrders.UserName);
                }
            }

            else if (thread.Type == this.constants.CHAT_THREAD_TYPE_SUPPORT) {
                var chatThreadSupport = <ChatThreadSupport>thread;

                // Check if message has `CustomerName` placeholder
                if (messageText.indexOf('${CustomerName}') > -1) {
                    messageText = messageText.replace('${CustomerName}', chatThreadSupport.RestUserID ? chatThreadSupport.RestUserName : chatThreadSupport.CustomerID ? chatThreadSupport.CustomerName : chatThreadSupport.GuestName);
                }

                // Check if message has `UserName` placeholder
                if (messageText.indexOf('${UserName}') > -1) {
                    messageText = messageText.replace('${UserName}', chatThreadSupport.UserName);
                }
            }

            message.Message = messageText;

        }

        this.nps.to(`thread-${message.ThreadID}`).emit('receive-message', { message: message });

        this.db.createChatMessage(message);
    }

    public assignChatsToUserHelper = async (maxCustomersPerUser: number) => {
        Util.log(this.LOG_TAG, `${this.userSocketList.length} User(s) are online`);

        var assigning = false;

        // Find a customer that is not assigned based on First come first serve
        var socketList = this.guestSocketList.concat(this.customerSocketList).concat(this.restUserSocketList);
        socketList.sort((s1, s2) => s1.joinedTimestamp - s2.joinedTimestamp);
        socketList = socketList.filter(c => c.thread.UserID == null);

        if (socketList.length > 0) {
            var selectedSocket = socketList[0];
            // Util.log(this.LOG_TAG, 'selectedSocket', selectedSocket);

            Util.log(this.LOG_TAG, 'Person not assigned', socketList);

            // Finding a `User` who has `least` amount of threads, in case of tie, who sent message earlier
            var userSocket: Socket = null;

            // Filter list by PublicKey/CompanyID of `selectedSocket`
            var userSocketList = this.userSocketList.filter(u => u.user.PlatformCompanyID == selectedSocket.user.PlatformCompanyID);

            Util.log(this.LOG_TAG, 'Users to assigned', userSocketList);

            // selectedSocket.userType
            for (var i = 0; i < userSocketList.length; i++) {
                var socket = userSocketList[i];

                if (!userSocket) {
                    userSocket = socket;
                }
                else {
                    if (socket.threads.length < userSocket.threads.length) {
                        userSocket = socket;
                    }
                    else if (socket.threads.length == userSocket.threads.length && socket.lastMessageSent < userSocket.lastMessageSent) {
                        userSocket = socket;
                    }
                }
            }

            if (userSocket) {
                Util.log(this.LOG_TAG, `User socket limit ${userSocket.threads.length} / ${maxCustomersPerUser}`);
            }

            // Assigning, if the user has not reached limit
            if (userSocket && userSocket.threads.length < maxCustomersPerUser) {
                assigning = true;

                // Assign the customer
                selectedSocket.thread.UserID = userSocket.user.ID;
                selectedSocket.thread.UserName = (userSocket.user.FirstName || '') + ' ' + (userSocket.user.LastName || '');

                // Push the thread in user threads
                userSocket.threads.push(selectedSocket.thread);

                userSocket.join(`thread-${selectedSocket.thread.ID}`);

                // Emit to customer that user is assigned
                selectedSocket.emit('user-assigned', { thread: selectedSocket.thread });

                // Emit to user that customer is assigned
                userSocket.emit('new-thread', { thread: selectedSocket.thread });

                this.emitThreadOnlineUsers(selectedSocket.thread);

                // Send Welcome message to customer
                this.db.getWelcomeMessageForCustomer()
                    .then(async (result: sql.IResult<any>) => {
                        if (result.recordset.length > 0) {
                            var item = result.recordset[0];

                            var messageText = item.Value;

                            var message = new ChatMessage();
                            message.Message = messageText;
                            message.ThreadID = selectedSocket.thread.ID;
                            message.SenderType = userSocket.userType;

                            this.sendMessageToThread(userSocket, selectedSocket.thread, message);
                        }
                        await this.assignChatsToUserHelper(maxCustomersPerUser);
                    });

                // Assign user to thread orders in DB
                if (selectedSocket.thread.Type == this.constants.CHAT_THREAD_TYPE_ORDERS) {
                    await this.db.assignUserToThreadOrders(selectedSocket.thread.TypeDataID, selectedSocket.thread.UserID)
                }

                // Assign user to thread support in DB
                else if (selectedSocket.thread.Type == this.constants.CHAT_THREAD_TYPE_SUPPORT) {
                    await this.db.assignUserToThreadSupport(selectedSocket.thread.TypeDataID, selectedSocket.thread.UserID)
                }

                await this.assignChatsToUserHelper(maxCustomersPerUser);

                Util.log(this.LOG_TAG, 'User with least people', userSocket.user.FirstName, userSocket.threads.length);
            }
        }
        else {
            Util.log(this.LOG_TAG, 'All people are assigned');
        }

        if (!assigning) {
            this.isAssigningToUser = false;
        }
    }

    // Assign Chat to User, If there is any
    public assignChatsToUser = async () => {
        Util.log(this.LOG_TAG, '_assignChatToUser');

        if (!this.isAssigningToUser && this.userSocketList.length > 0 && (this.guestSocketList.length > 0 || this.customerSocketList.length > 0 || this.restUserSocketList.length > 0)) {
            this.isAssigningToUser = true;

            var result = await this.db.getMaxCustomersPerUser()
            var maxCustomersPerUser = this.constants.DEFAULT_MAX_CUSTOMERS_PER_USER;

            if (result.recordset.length > 0) {
                var item = result.recordset[0];
                maxCustomersPerUser = item.Value;
            }

            this.assignChatsToUserHelper(maxCustomersPerUser);
        }
        else {
            if (this.isAssigningToUser) {
                Util.log(this.LOG_TAG, `Already Assigning users`);
            }
            else if (this.userSocketList.length == 0) {
                Util.log(this.LOG_TAG, `No Users is online`);
            }
            else if (this.customerSocketList.length == 0) {
                Util.log(this.LOG_TAG, `No Customer is online`);
            }
            else if (this.guestSocketList.length == 0) {
                Util.log(this.LOG_TAG, `No Guest is online`);
            }
        }
    }

    public hasJoinedRoom = (socket: Socket, threadID: number) => {
        return typeof socket.rooms[`thread-${threadID}`] !== 'undefined';
    }

    public emitThreadOnlineUsers = (thread: ChatThread) => {
        this.nps.to(`thread-${thread.ID}`).emit('thread-online-users',
            {
                threadID: thread.ID,
                guest: {
                    ID: (<ChatThreadSupport>thread).GuestID,
                    online: this.isOnline('guest', (<ChatThreadSupport>thread).GuestID, thread.ID),
                },
                customer: {
                    ID: thread.CustomerID,
                    online: this.isOnline('customer', thread.CustomerID, thread.ID),
                },
                user: {
                    ID: thread.UserID,
                    online: this.isOnline('user', thread.UserID, thread.ID),
                },
                restUser: {
                    ID: thread.RestUserID,
                    online: this.isOnline('rest-user', thread.RestUserID, thread.ID),
                },
            }
        );
    }

    public isOnline = (type: string, id: any, threadID: number) => {
        Util.log(this.LOG_TAG, 'isOnline', type, id, threadID);

        var isOnline = false;

        if (!id) return isOnline;

        var list: Array<Socket> = null;

        if (type == 'guest') {
            var items = this.guestSocketList.filter(s => (<Guest>s.user).GuestID == id);

            if (items.length > 0) {
                var guest = items[0];

                if (guest.thread.ID == threadID) {
                    isOnline = true;
                }
            }
        }
        else if (type == 'customer') {
            var items = this.customerSocketList.filter(s => s.user.ID == id);

            if (items.length > 0) {
                var customer = items[0];

                if (customer.thread.ID == threadID) {
                    isOnline = true;
                }
            }
        }
        else if (type == 'user') {
            var items = this.userSocketList.filter(s => s.user.ID == id);

            if (items.length > 0) {
                var user = items[0];

                var tItems = user.threads.filter(t => t.ID == threadID);

                if (tItems.length > 0) {
                    isOnline = true;
                }
            }
        }
        else if (type == 'rest-user') {
            var items = this.restUserSocketList.filter(s => s.user.ID == id);

            if (items.length > 0) {
                var restUser = items[0];

                if (restUser.thread.ID == threadID) {
                    isOnline = true;
                }
            }
        }

        return isOnline;
    }

    public emitMessageTemplates = (socket: Socket) => {

        this.db.getMessageTemplates()
            .then((result: sql.IResult<any>) => {
                socket.emit('send-message-templates', { messageTemplates: result.recordset });
            });
    }
}