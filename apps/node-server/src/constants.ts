export class Constants {
    public static readonly DEBUG_LOG = false;

    public static readonly ENV_LOCAL: string = 'ENV_LOCAL';
    public static readonly ENV_DEV: string = 'ENV_DEV';
    public static readonly ENV_LIVE: string = 'ENV_LIVE';

    public static readonly ENV: string = Constants.ENV_LIVE;

    public readonly PORT = 8200;

    public static readonly PATTERN_EMAIL = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    public static readonly PATTERN_PHONE = /^[0-9\-\+]{10,10}$/;

    // Chat
    public readonly CHAT_THREAD_TYPE_ORDERS = 1;
    public readonly CHAT_THREAD_TYPE_SUPPORT = 2;

    public readonly DEFAULT_MAX_CUSTOMERS_PER_USER = 5;

    public static readonly DATASSENTIAL_URL = 'https://apps.datassential.com/';

    public static get BASE_URL(): string {
        var url = '';

        if (Constants.ENV == Constants.ENV_LOCAL) {
            url = 'http://localhost:8200';
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            url = 'https://devapi.dishzilla.com';
        }
        else if (Constants.ENV == Constants.ENV_LIVE) {
            url = 'https://api.dishzilla.com';
        }
        return url;
    }

    public static get API_URL(): string {
        var url = '';

        if (Constants.ENV == Constants.ENV_LOCAL) {
            url = 'https://dev.dishzilla.com';
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            url = 'https://dev.dishzilla.com';
        }
        else if (Constants.ENV == Constants.ENV_LIVE) {
            url = 'https://live.dishzilla.com';
        }
        return url;
    }

    public static get GS_PATH(): string {
        var url = '';

        if (Constants.ENV == Constants.ENV_LOCAL) {
            url = `"C:\\Program Files (x86)\\gs\\gs9.23\\bin\\gs"`;
        }
        else if (Constants.ENV == Constants.ENV_DEV || Constants.ENV == Constants.ENV_LIVE) {
            url = `"C:\\Program Files\\gs\\gs9.23\\bin\\gs"`;
        }

        return url;
    }

    public get DBConfig(): any {
        var config = null;

        if (Constants.ENV == Constants.ENV_LOCAL) {
            config = {
                user: 'newuser',
                password: '1234',
                server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
                database: 'Menus_Dev',
                // port: 1433,

                options: {
                    // encrypt: true // Use this if you're on Windows Azure 
                }
            }
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            config = {
                user: 'api.menus.com',
                password: 'L77~v~mvS,{[EN]s[4DEU445123',
                server: 'localhost',
                database: 'Menus_Dev',
                port: 2626,
                options: {}
            };
        }
        else if (Constants.ENV == Constants.ENV_LIVE) {
            config = {
                user: 'api.menus.com',
                password: 'L77~v~mvS,{[EN]s[4DEU445123',
                server: 'localhost',
                database: 'Menus_Live',
                port: 2626,
                options: {}
            };
        }
        return config;
    }

    // public get socketIOConfig(): any {
    //     var config = null;

    //     if (Constants.ENV == Constants.ENV_LOCAL) {
    //         config = { path: '/socket.io' };
    //     }
    //     else if (Constants.ENV == Constants.ENV_DEV) {
    //         config = { path: '/dev/socket.io' };
    //     }
    //     else if (Constants.ENV == Constants.ENV_DEV) {
    //         config = { path: '/live/socket.io' };
    //     }

    //     return config;
    // }

}