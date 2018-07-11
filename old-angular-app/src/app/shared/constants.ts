import { IMyDpOptions } from 'mydatepicker';

/**
 * Constants
 */
declare var google;

export class Constants {
    public static readonly DEBUG = true;

    public static readonly ENV_LOCAL: string = 'ENV_LOCAL';
    public static readonly ENV_DEV: string = 'ENV_DEV';
    public static readonly ENV_LIVE: string = 'ENV_LIVE';

    public static ENV: string = Constants.ENV_DEV;

    public readonly SERVER_URL: string;
    public readonly API_URL: string;
    public readonly RO_API_URL: string;

    public static readonly DOMAIN_NAME = 'menus.com';
    public readonly PDF_VIEWER = `https://${Constants.DOMAIN_NAME}/pdf-viewer/web/viewer.html`;

    public readonly API_KEY = 'API_TEST_KEY';

    public readonly RECAPTCHA_SITE_KEY = '6Lf8HikUAAAAAO60BEsv6yI_5XNdeybKsC1hz08j';

    public readonly MODE_CREATE = 1;
    public readonly MODE_UPDATE = 2;

    public readonly CART_ITEM_MAX_LIMIT = 25;

    // Service Types (string)
    public readonly SERVICE_TYPE_DINEIN = 'dine-in';
    public readonly SERVICE_TYPE_CATERING = 'catering';
    public readonly SERVICE_TYPE_DELIVERY = 'delivery';
    public readonly SERVICE_TYPE_PICKUP = 'pick-up';

    // Marker
    public readonly REST_MARKER_ZINDEX = 100;
    public readonly ACTIVE_REST_MARKER_ZINDEX = 101;

    // View Modes
    public readonly VIEW_MODE_DISH = 'dish';
    public readonly VIEW_MODE_RESTAURANT = 'restaurant';

    // Delivery Modes
    public readonly DELIVERY_MODE_SCHLEP_FETCH = 4;

    // Keywords Type
    public readonly KEYWORD_NONE = -1;
    public readonly KEYWORD_TYPE_MENU_ITEM = 0;
    public readonly KEYWORD_TYPE_CUISINE = 1;
    public readonly KEYWORD_TYPE_DISH = 2;
    public readonly KEYWORD_TYPE_RESTAURANT = 3;

    public readonly KEYWORD_SEPRATOR = '|';

    public readonly SERVICE_TYPE_ID_DINEIN = 1;
    public readonly SERVICE_TYPE_ID_CATERING = 2;
    public readonly SERVICE_TYPE_ID_DELIVERY = 3;
    public readonly SERVICE_TYPE_ID_PICKUP = 4;

    public readonly SERVICE_TYPE_ID = {};

    public readonly SERVICE_TYPE_TITLE = {};

    public readonly WEEK_DAYS = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
    };

    public readonly DEFAULT_MAP_OPTIONS = {
        draggable: true,
        streetViewControl: false,
        zoom: 12,
        disableDoubleClickZoom: false,
        mapTypeId: typeof google !== 'undefined' && google ? google.maps.MapTypeId.ROADMAP : {},
        mapTypeControl: false,
        clickableIcons: false,
        disableDefaultUI: true,
        scrollwheel: false,
        styles: [
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e9e9e9"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dedede"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#333333"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            }
        ]
    };

    public readonly DELIVERY_STEPS_TEXT = ['FREE', '$3 max', '$5 max', 'All'];
    public readonly DELIVERY_STEPS_VAL = [0, 3, 5, ''];

    public readonly MIN_ORDER_STEPS_TEXT = ['$15 max', '$25 max', '$50 max', 'All'];
    public readonly MIN_ORDER_STEPS_VAL = [15, 25, 50, ''];

    public readonly CARD_TYPE_CLASS = {
        'MasterCard': 'mastercard',
        'Visa': 'visa',
        'Discover': 'discover',
        'American Express': 'amex',
    };

    /**
     * Rest Owner
     */
    public readonly NOTIFICATION_TONE_DIR = '/audio/notifications';

    public readonly DEFAULT_NOTIFICATION_TONE: string;
    public readonly NOTIFICATION_TONE_LIST = [];

    public readonly RO_ALLOWED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    public readonly RO_MAX_IMG_SIZE = 5;

    public readonly PRICING_MARKETPLACE = 1;
    public readonly PRICING_COMBO = 2;
    public readonly PRICING_PLATFORM = 3;

    public readonly RO_SUB_BASIC = 1;
    public readonly RO_SUB_PRO = 2;

    public readonly ZONE_TYPE_POLYGON = 1;
    public readonly ZONE_TYPE_CIRCLE = 2;

    public readonly MAX_REST_SELECTION_LIMIT = 20;

    public readonly EMPTY_TIME = '00:00:00';

    public readonly MENUS_LOGO_BASE64 = 'data:image/png;base64,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';

    public readonly RO_USER_LEVEL_ADMIN = 4;
    public readonly RO_USER_LEVEL_USER = 5;
    public readonly RO_USER_LEVEL_AGENT_ADMIN = 7;
    public readonly RO_USER_LEVEL_AGENT = 8;

    public readonly DISCOUNT_TYPE_PERCENT = 1;
    public readonly DISCOUNT_TYPE_AMOUNT = 2;

    public readonly DISCOUNT_CRITERIA_FULL = 1;
    public readonly DISCOUNT_CRITERIA_INCREMENTAL = 2;

    public readonly RO_USER_LEVEL = {};

    public readonly RO_USER_LEVEL_LIST = [];

    public readonly STATUS_SUCCESS = 'success';
    public readonly STATUS_ERROR = 'error';

    // Socket
    public readonly SOCKET_SERVER: string;
    // public readonly SOCKET_PATH: string;

    ORDER_STATUS = {
        ACCEPTED: 14,
        QUEUE_ADDED: 6,
        CANCELLED_BY_REST: 2
    }

    public readonly SERVER_DATE_FORMAT = 'YYYY-MM-DD';
    public readonly DATE_RANGE_PICKER_OPTIONS: IMyDpOptions = {
        dateFormat: 'yyyy/mm/dd',
        height: '40px',
    };

    public readonly chartColors = {
        red: '#FF6182',
        blue: '#2EA0EE',
        purple: '#BC49FF',
        yellow: '#FFCF49',
        gray: 'rgba(179, 181, 198, 1)',
    };

    public readonly chartColorsArray = [];

    public readonly colors = {
        brandSuccess: '#39CE7B',
        darkGray: '#455A65',
    };

    constructor() {
        // Server URL
        if (Constants.ENV == Constants.ENV_LIVE) {
            this.SERVER_URL = `https://live.${Constants.DOMAIN_NAME}`;
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            this.SERVER_URL = `https://dev.${Constants.DOMAIN_NAME}`;
        }
        else if (Constants.ENV == Constants.ENV_LOCAL) {
            this.SERVER_URL = `https://dev.${Constants.DOMAIN_NAME}`;
        }

        this.API_URL = this.SERVER_URL + '/api';
        this.RO_API_URL = this.SERVER_URL + '/APIOwner';

        // Service Types (number)
        this.SERVICE_TYPE_ID['dine-in'] = 1;
        this.SERVICE_TYPE_ID['catering'] = 2;
        this.SERVICE_TYPE_ID['delivery'] = 3;
        this.SERVICE_TYPE_ID['pick-up'] = 4;

        this.SERVICE_TYPE_TITLE[1] = this.SERVICE_TYPE_DINEIN;
        this.SERVICE_TYPE_TITLE[2] = this.SERVICE_TYPE_CATERING;
        this.SERVICE_TYPE_TITLE[3] = this.SERVICE_TYPE_DELIVERY;
        this.SERVICE_TYPE_TITLE[4] = this.SERVICE_TYPE_PICKUP;

        this.RO_USER_LEVEL[this.RO_USER_LEVEL_ADMIN] = 'Admin';
        this.RO_USER_LEVEL[this.RO_USER_LEVEL_USER] = 'User';

        // RO USER LEVEL
        this.RO_USER_LEVEL_LIST = [];

        for (var userIndex in this.RO_USER_LEVEL) {
            var item = {
                id: userIndex,
                value: this.RO_USER_LEVEL[userIndex]
            };

            this.RO_USER_LEVEL_LIST.push(item);
        }

        // Chart Colors
        for(var key in this.chartColors) {
            var colorValue = this.chartColors[key];

            this.chartColorsArray.push(colorValue);
        }

        // Notification Tone List
        for (var index = 1; index <= 38; index++) {

            var notificationItem = {
                title: `Notification ${index}`,
                fileName: `notification_${index >= 1 && index <= 9 ? ('0' + index) : index}.mp3`,
            };

            this.NOTIFICATION_TONE_LIST.push(notificationItem);
        }

        this.DEFAULT_NOTIFICATION_TONE = this.NOTIFICATION_TONE_LIST[3].fileName;

        // Socket
        if (Constants.ENV == Constants.ENV_LIVE) {
            this.SOCKET_SERVER = `https://api.menus.com`;
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            this.SOCKET_SERVER = `https://devapi.menus.com`;
        }
        else if (Constants.ENV == Constants.ENV_LOCAL) {
            this.SOCKET_SERVER = `http://localhost:8200`;
        }
    }
}