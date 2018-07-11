import { IMyDpOptions } from 'mydatepicker';
import { PlatformSettings } from './models/platform-settings';
import { DomSanitizer } from '@angular/platform-browser/src/security/dom_sanitization_service';

/**
 * Constants
 */
declare var google;

export class Constants {
    public APP_VERSION = ``;
    public static readonly DEBUG = true;
    public readonly INTERNAL_DEBUG = true;
    public ENABLE_BETA_FEATURES: boolean = true;

    public PUBLIC_KEY = ''; //025cb9f688eb4a098727bde95

    public static readonly ENV_LOCAL: string = 'ENV_LOCAL';
    public static readonly ENV_DEV: string = 'ENV_DEV';
    public static readonly ENV_LIVE: string = 'ENV_LIVE';

    public static ENV: string = Constants.ENV_DEV;

    // App Type
    public APP_TYPE_WEB = 'WEB';
    public APP_TYPE_MOBILE = 'MOBILE';
    public APP_TYPE_CONSUMER = 'CONSUMER';
    public APP_TYPE_BACKOFFICE = 'BACKOFFICE';
    public APP_TYPE = new Array<string>();

    public LocationStrategy: string;
    public SERVER_URL: string;
    public API_URL: string;
    public RO_API_URL: string;
    public IFRAME_WEB_APP_URL: string;
    public IFRAME_MOBILE_APP_URL: string;

    public static readonly DOMAIN_NAME = 'dishzilla.com';
    public readonly PDF_VIEWER = `https://${Constants.DOMAIN_NAME}/pdf-viewer/web/viewer.html`;

    public readonly API_KEY = 'API_TEST_KEY';

    public readonly RECAPTCHA_SITE_KEY = '6Lf8HikUAAAAAO60BEsv6yI_5XNdeybKsC1hz08j';

    public readonly MODE_CREATE = 1;
    public readonly MODE_UPDATE = 2;

    public readonly MAX_ITEMS_PS = 999999999;
    public readonly CART_ITEM_MAX_LIMIT = 25;

    public readonly CART_MENU_ITEM_QTY_MAX_LIMIT = 1;
    public readonly CART_MENU_ITEM_QTY_ZERO_LIMIT = 2;
    public readonly CART_MENU_ITEM_QTY_UPDATED = 3;

    // Service Types (string)
    public readonly SERVICE_TYPE_ALL = 'all';
    public readonly SERVICE_TYPE_DINEIN = 'dine-in';
    public readonly SERVICE_TYPE_CATERING = 'catering';
    public readonly SERVICE_TYPE_DELIVERY = 'delivery';
    public readonly SERVICE_TYPE_PICKUP = 'pick-up';

    // Marker
    public readonly REST_MARKER_ZINDEX = 100;
    public readonly ACTIVE_REST_MARKER_ZINDEX = 101;

    // View Modes
    public readonly VIEW_MODE_DISH = 0;
    public readonly VIEW_MODE_RESTAURANT = 1;

    // Delivery Modes
    public readonly DELIVERY_MODE_MENUS = 2;
    public readonly DELIVERY_MODE_SCHLEP_FETCH = 5;

    public readonly DEFAULT_LAT = 34.07651000;
    public readonly DEFAULT_LNG = -118.29381380;

    // Filters
    public readonly FILTER_USER_ADDRESS = 'FILTER_USER_ADDRESS';
    public readonly FILTER_KEYWORDS = 'FILTER_KEYWORDS';
    public readonly FILTER_VIEW_MODE = 'FILTER_VIEW_MODE';
    public readonly FILTER_CUISINE = 'FILTER_CUISINE';
    public readonly FILTER_SERVICE_TYPE = 'FILTER_SERVICE_TYPE';
    public readonly FILTER_MIN_PRICE = 'FILTER_MIN_PRICE';
    public readonly FILTER_MAX_PRICE = 'FILTER_MAX_PRICE';
    public readonly FILTER_DELIVERY_FEE = 'FILTER_DELIVERY_FEE';
    public readonly FILTER_MIN_ORDER = 'FILTER_MIN_ORDER';
    public readonly FILTER_PROXIMITY = 'FILTER_PROXIMITY';

    // Chat
    public readonly CHAT_THREAD_TYPE_ORDERS = 1;
    public readonly CHAT_THREAD_TYPE_SUPPORT = 2;

    // Messages
    public readonly MSG_WARN_CHANGE_ADDRESS = 'If you change the address then the item(s) in your shopping cart might get updated or removed according to your new location.';

    public IMG_CHECKBOX: any;
    public IMG_CHECKBOX_ACTIVE: any;
    public IMG_RADIO: any;
    public IMG_RADIO_ACTIVE: any;

    // Keywords Type
    public readonly KEYWORD_NONE = -1;
    public readonly KEYWORD_TYPE_MENU_ITEM = 0;
    public readonly KEYWORD_TYPE_CUISINE = 1;
    public readonly KEYWORD_TYPE_DISH = 2;
    public readonly KEYWORD_TYPE_RESTAURANT = 3;

    public readonly KEYWORD_SEPRATOR = '|';

    public readonly SERVICE_TYPE_ID_ALL = 0;
    public readonly SERVICE_TYPE_ID_DINEIN = 1;
    public readonly SERVICE_TYPE_ID_CATERING = 2;
    public readonly SERVICE_TYPE_ID_DELIVERY = 3;
    public readonly SERVICE_TYPE_ID_PICKUP = 4;

    public readonly SERVICE_TYPE_ID = {};

    public readonly SERVICE_TYPE_TITLE = {};

    public readonly BRAINTREE_PAYMENT_STATUS = {
        0: 'Pending',
        1: 'Approved',
        2: 'Declined',
    };

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
    public readonly NOTIFICATION_TONE_DIR = '/assets/audio/notifications';

    public DEFAULT_NOTIFICATION_TONE: string;
    public readonly NOTIFICATION_TONE_LIST = [];

    public readonly RO_IMG_TYPE_PNG = 'image/png';
    public readonly RO_ALLOWED_IMG_TYPES = [this.RO_IMG_TYPE_PNG, 'image/jpeg', 'image/jpg'];
    public readonly RO_MAX_IMG_SIZE = 5;

    public readonly MAP_REST_ZINDEX = 100;
    public readonly MAP_REST_ACTIVE_ZINDEX = 101;
    public readonly MAP_USER_ZINDEX = 102;

    public readonly PRICING_MARKETPLACE = 1;
    public readonly PRICING_COMBO = 2;
    public readonly PRICING_PLATFORM = 3;

    public readonly PRICING_TITLE_MARKETPLACE = 'marketplace';
    public readonly PRICING_TITLE_COMBO = 'combo';
    public readonly PRICING_TITLE_PLATFORM = 'platform';

    public readonly PRICING_ID = {};
    public readonly PRICING_TITLE = {};

    public readonly RO_SUB_FREE = 0;
    public readonly RO_SUB_BASIC = 1;
    public readonly RO_SUB_PRO = 2;

    public readonly ZONE_TYPE_POLYGON = 1;
    public readonly ZONE_TYPE_CIRCLE = 2;

    public readonly MAX_REST_SELECTION_LIMIT = 20;

    public readonly EMPTY_TIME = '00:00:00';

    public readonly BRAND_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXcAAAAzCAAAAABJFRfsAAAHeElEQVR42u3caWxURRwA8CmUQAREFAEFKRACgUJpSKhylBZqhVQjIMqtgpICMQREwCLeEI0pUAo9sEBIQzFAYxtY2kJpaw8lHFpFFFxLkUOwIlcWkKPKuNuuy87853rzXt/uB/5fys6bNzPvt7Oz783MgnATxaVdy6cO69G+RUho6y4RCXNTS1z4ftwL1PjnaNE+GMWl1Ze5Jx4jzth9iTj4ZTxiROSyo355dhFV7aHLv+nwP763yptaWlVVVemOioqK8vLyr9xRVlbqjpISxgXkuv4s8H9deMJTRk0h0fI6xsV9u8c/i+OmmmVBMVF74Sm5+1jEi04zipgnTiWz7fY7tBjx4/m9vprJoMv/lTzcrjH1Z2Qk2uAsMmGhp4x5ZFo24+IGk1mcSuzVdPUhcveXhe0fUw1PnE1mKfYdcMg0Xrui4v4bebgH893wRSgzFeMtZMJ7njKSyLTtDJWnySy1Su5RoP5vTLq7u1uRqvskhX54yHL3t1mJhba6X4MNiDDtjlDHs0ruQxXYYy3v7yUDGYkJ2Fb3VxlNuGjeHaG5Cu6zVIZdbLX7bMyrxkZ3VhMmWuGOHpS6H1IpZqNV7kt8HTuRUU2tve6fCLqYSXeEzkvcVcp4DFvkXusd1Ccz612C7XVnX+z71rijk0L3nSpFXLHI/SLu0vB3LcarYC0dsL3uecIx1bQ7uipyH6xQwAJsiXuit4SW59h9rd5m986cy/3CInckcmdk7xbePYTta8Y97hpu7OWZnsQUWO0WbK/7MR7XQ1a5R/LdT9B5H/UOS87U4f8nHTbn/pP7n60W3W4sICqfN7Q+hW12j+F6VRtxH5QQO6Atp6BtXPfdosGtYJgnJR6bc693+r5hfJMmcwWjqk3ud/j9NMqI+4GGxDNrevFHGob7VirjJKqutwhdLXe158Tv7HafLRggrhlw901eXWZ8gD7kudPf6T1BbYeawD0MNPB1bLc7mT2ZePWKjjvGVZwOz3D/ns4Y/5f6Da+u+0bQvJbYbnfyi73n3wq3klJ3fB1cWL76/UzzWWVN636X/4BgnzuZ+03q9ad67thJX1gMz70jc4Drv+KkhvtVNffHQXUp2G73Inr2N0be4RXc8UzWQMNyX879cpngkLknjCQibqiS+7ugpj7YdvfutE4aY3zQcAfjR43O/Ex8ucqEBi/Y7idlD+Z2uJ8iM4djfIFM6azrHs2YUWS6zxPjJVvtDvPts999DLzdoxp1XNM9gypnPnf+Xca31lL3Z0C2sdh+d6oJx+BydYymO32DOI7rfkHm16rOOvc8+fSfDe4LGE3YwZ6lM+p+mSpmBH+d7wep4AbL3GGu0wFwZ37iwIKYlvsNxrQTb137tJRwhUXucOp1GbbffT1cTHdHhGwaXsn9AmNhmruPAw+UGToscU8CeTrhALiHMoWzRA8Vyu704PGi0B0XKs3hm3Q/AfPcDYB7OdWGMZwxUMs9mypksdgd400hQsQ4C9y5E9T2uvelGlHgTe9PpRfpuE+jCsmRubv7wTDZaqE59ziQIxoHwL2O168/p9K7W/G8ek7u7hnjIrmKc2ChR0qJqMwRuucqriA3tft4qhGjuWanjLvvUZ2fAeGY1ow7wkvYzovcGbOQRwLiTrfi3vbccM7Ab8C9OVXEs8ru7ri15QmG+w1z88AdmZ8g+92X8j90+eLPo4L7OLqEEpF7/nnQunXQfa8pd7jR+wEcEHfwNB7Z1xvh/bgbWBTdJyqvN3mbkgiaNxoUkWHG3QnfR1dA3LMN3RoYcv+lHTh/lch9ZMP9vVM8r4bQZ2bc4SWl4YC4tzHkvl7u7t0w78rsZmQ/gTu+9r5s9sZ+v0pGgDJSTbjHgtKGYBPuBXJ3znbqg8ZuhUPl7hM/WDJnbD/RU77CPHDX6allZ9zPkGeeg4Xk6btvY/SkrEwQ67Yruo9MnOkfE2qg+0uziCzjvNOLg4y5o3Iz+8WGiPYDKxfzu7b7P6pVhCm601EJ3em4zVoBlkffptofWWukFE33DqpVDNB03y93v9PQkqlG3VGdvrtL5N5ctZQXtN0XoqBxN8yOxjfN/vck5QbU6LofR0Hj/rFxd6Trflb0ew+XcvUR2vuWUPC4g9SuM6aQAfa/oKVa7i3vYpF7J2WS27ru0cHjvgOkwhvSPvwOb8B9imgLbDFjCxEv8nT36W1FweP+iMKEaDrIk23YvcVRLHavbasIslJ3f2Q9Ch73H0HiKJWV99ZG3TdLtnx7vlc3KHnkau9LbR9E7nBZh7UbrzfIddCIe7+d0q32jc9Nm6R9vtt17f3A81HwuN9UW3dJA7kGke7j+ZXEZjInJ6azv1RqRT99QL0qlPcD15CHH8aVBu/Zwhi74xd50iTvn6eJT4qz3IJz42i44kbCs4R76dpMRmTlHq7nzThVpPrnXO13h/lHyig2+kfET06S/c/PSKfLd630P56eg9enZRqJtIb5GWeKf9qaht+bHEgVnbfa81DpWCfKkvwvXp1Bpa1h/18pm9PpfFWEu+VRnf3O5OjeHVqFoNB2YVETknKc+H74xX9iyK6T3NLFigAAAABJRU5ErkJggg==';

    public readonly RO_USER_LEVEL_SUPER_ADMIN = 1;
    public readonly RO_USER_LEVEL_ADMIN = 4;
    public readonly RO_USER_LEVEL_USER = 5;
    public readonly RO_USER_LEVEL_AGENT_ADMIN = 7;
    public readonly RO_USER_LEVEL_AGENT = 8;

    public readonly COUPON_TYPE_ORDER_BASED = 1;
    public readonly COUPON_TYPE_ITEM_BASED = 2;

    public readonly DISCOUNT_TYPE_PERCENT = 1;
    public readonly DISCOUNT_TYPE_AMOUNT = 2;

    public readonly DISCOUNT_CRITERIA_FULL = 1;
    public readonly DISCOUNT_CRITERIA_INCREMENTAL = 2;

    public readonly DURATION_TYPE_ALWAYS = 1;
    public readonly DURATION_TYPE_DATE = 2;

    public readonly TAB_REST_INFO = 'restinfo';
    public readonly TAB_MENUS = 'menus';
    public readonly TAB_ORDERS = 'orders';
    public readonly TAB_COUPONS = 'coupons';
    public readonly TAB_PREVIEW = 'preview';
    public readonly TAB_CHARTS = 'charts';
    public readonly TAB_FIN_REPORT = 'finreport';
    public readonly TAB_FIN_STATEMENT = 'finstatement';
    public readonly TAB_CUSTOMER_REVIEW = 'customerreview';

    public readonly PROFILE_TAB_ORDERS = 'PROFILE_TAB_ORDERS';
    public readonly PROFILE_TAB_REVIEWS = 'PROFILE_TAB_REVIEWS';
    public readonly PROFILE_TAB_SETTINGS = 'PROFILE_TAB_SETTINGS';

    public readonly RO_USER_LEVEL = {};

    public RO_USER_LEVEL_LIST = [];

    public readonly STATUS_SUCCESS = 'success';
    public readonly STATUS_ERROR = 'error';

    // Socket
    public SOCKET_SERVER: string;
    public get SOCKET_SERVER_CHAT() : string {
        return `${this.SOCKET_SERVER}/chat`;
    }
    
    // public readonly SOCKET_PATH: string;

    ORDER_STATUS = {
        CANCELLED_BY_REST: 2,
        APPROVED: 5,
        QUEUE_ADDED: 6,
        ACCEPTED: 14
    }

    ORDER_STATUS_TEXT = {};

    public readonly SERVER_DATE_FORMAT = 'YYYY-MM-DD';
    public readonly DATE_RANGE_PICKER_OPTIONS: IMyDpOptions = {
        dateFormat: 'yyyy/mm/dd',
        height: '40px',
    };

    public readonly chartColors = {
        purple: '#BC49FF',
        blue: '#2EA0EE',
        red: '#FF6182',
        yellow: '#FFCF49',
        gray: 'rgba(179, 181, 198, 1)',

        red1: '#F44336',

        pink: '#E91E63',
        pink1: '#C51162',

        purple1: '#7B1FA2',
        purple2: '#673AB7',
        purple3: '#6200EA',

        blue1: '#3F51B5',
        blue2: '#1E88E5',
        blue3: '#2962FF',
        blue4: '#0288D1',
        blue5: '#304FFE',

        green: '#0097A7',
        green1: '#009688',
        green2: '#43A047',
        green3: '#558B2F',
        green4: '#AFB42B',
        green5: '#006064',

        yellow1: '#F9A825',

        orange: '#FF6F00',
        orange1: '#E65100',
        orange2: '#F4511E',
        orange3: '#FF3D00',

        brown: '#795548',

        gray1: '#9E9E9E',
        gray2: '#607D8B',
    };

    public readonly chartColorsArray = [];

    public readonly colors = {
        brandPrimary: '#F96C30',
        brandSuccess: '#39CE7B',
        brandInfo: '#64335D',
        brandWarning: '#FFC63A',
        brandDanger: '#F94D30',
        darkGray: '#455A65',
    };

    public readonly CARD_MONTHS = [];
    public readonly CARD_YEARS = [];

    public get IsBeta(): boolean {
        return this.ENABLE_BETA_FEATURES;
    }

    public initPlatformConstants = (sanitizer: DomSanitizer, platformSettings: PlatformSettings) => {
        var colorBalanced = platformSettings.Color_Balanced; //#39CE7B

        this.IMG_CHECKBOX = sanitizer.bypassSecurityTrustUrl("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Echeckbox-off%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='UI' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='checkbox-off'%3E %3Cg id='Group-3'%3E %3Crect id='Rectangle' x='0' y='0' width='24' height='24'%3E%3C/rect%3E %3Cpath d='M19.7777778%2C3 C20.4542202%2C3 21%2C3.5476683 21%2C4.22222222 L21%2C19.7777778 C21%2C20.4523317 20.4542202%2C21 19.7777778%2C21 L4.22222222%2C21 C3.54577979%2C21 3%2C20.4523317 3%2C19.7777778 L3%2C4.22222222 C3%2C3.5476683 3.54577979%2C3 4.22222222%2C3 L19.7777778%2C3 Z' id='Shape' stroke='%23455A64' stroke-width='2' fill-rule='nonzero'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E");
        this.IMG_CHECKBOX_ACTIVE = sanitizer.bypassSecurityTrustUrl("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Echeckbox-on%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='UI' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='checkbox-on'%3E %3Cg id='Group-3'%3E %3Crect id='Rectangle' x='0' y='0' width='24' height='24'%3E%3C/rect%3E %3Cpath d='M19.7777778%2C2 L4.22222222%2C2 C2.98888889%2C2 2%2C3 2%2C4.22222222 L2%2C19.7777778 C2%2C21 2.98888889%2C22 4.22222222%2C22 L19.7777778%2C22 C21.0111111%2C22 22%2C21 22%2C19.7777778 L22%2C4.22222222 C22%2C3 21.0111111%2C2 19.7777778%2C2 Z M9.77777778%2C17.5555556 L4.22222222%2C12 L5.78888889%2C10.4333333 L9.77777778%2C14.4111111 L18.2111111%2C5.97777778 L19.7777778%2C7.55555556 L9.77777778%2C17.5555556 Z' id='Shape' fill='" + colorBalanced + "' fill-rule='nonzero'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E");
        this.IMG_RADIO = sanitizer.bypassSecurityTrustUrl("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Eradio-off%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='UI' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='radio-off'%3E %3Cg id='Group-3'%3E %3Crect id='Rectangle' x='0' y='0' width='24' height='24'%3E%3C/rect%3E %3Cg id='Group' transform='translate(2.000000%2C 2.000000)' stroke-width='2' stroke='%23455A64'%3E %3Ccircle id='Oval-Copy' cx='10' cy='10' r='9'%3E%3C/circle%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E");
        this.IMG_RADIO_ACTIVE = sanitizer.bypassSecurityTrustUrl("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3Eradio-on%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='UI' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='radio-on'%3E %3Cg id='Group-3'%3E %3Crect id='Rectangle' x='0' y='0' width='24' height='24'%3E%3C/rect%3E %3Cg id='Group' transform='translate(2.000000%2C 2.000000)'%3E %3Ccircle id='Oval' fill='" + colorBalanced + "' cx='10' cy='10' r='5'%3E%3C/circle%3E %3Ccircle id='Oval-Copy' stroke='" + colorBalanced + "' stroke-width='1.66666667' cx='10' cy='10' r='9.16666667'%3E%3C/circle%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E");
    }

    constructor() {
        this.init();
    }

    init = () => {
        if (this.INTERNAL_DEBUG) {
            if (typeof localStorage !== 'undefined') {

                if (Constants.ENV != Constants.ENV_LOCAL) {
                    var localStorageEnv = localStorage.getItem('app_env');
                    if (localStorageEnv) {
                        Constants.ENV = localStorageEnv;
                    }
                }

                var localStorageEnableBetaFeatures = localStorage.getItem('app_enable_beta_features');

                if (localStorageEnableBetaFeatures == 'true') {
                    this.ENABLE_BETA_FEATURES = true;
                }
                else {
                    this.ENABLE_BETA_FEATURES = false;
                }
            }
        }

        // Server URL
        if (Constants.ENV == Constants.ENV_LIVE) {
            this.SERVER_URL = `https://live.${Constants.DOMAIN_NAME}`;
            this.IFRAME_WEB_APP_URL = 'http://localhost:8003';
            this.IFRAME_MOBILE_APP_URL = 'https://dishzilla.com/mapp/index.html';
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            this.SERVER_URL = `https://dev.${Constants.DOMAIN_NAME}`;
            this.IFRAME_WEB_APP_URL = 'http://localhost:8003';
            this.IFRAME_MOBILE_APP_URL = 'http://test2.menus.mine.nu/mapp/index.html';
        }
        else if (Constants.ENV == Constants.ENV_LOCAL) {
            this.SERVER_URL = `https://dev.${Constants.DOMAIN_NAME}`;
            this.IFRAME_WEB_APP_URL = 'http://localhost:8003';
            this.IFRAME_MOBILE_APP_URL = 'http://localhost:8100';
        }

        this.API_URL = this.SERVER_URL + '/api';
        this.RO_API_URL = this.SERVER_URL + '/APIOwner';

        // Service Types (number)
        this.SERVICE_TYPE_ID['all'] = 0;
        this.SERVICE_TYPE_ID['dine-in'] = 1;
        this.SERVICE_TYPE_ID['catering'] = 2;
        this.SERVICE_TYPE_ID['delivery'] = 3;
        this.SERVICE_TYPE_ID['pick-up'] = 4;

        this.SERVICE_TYPE_TITLE[0] = this.SERVICE_TYPE_ALL;
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
        for (var key in this.chartColors) {
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
            this.SOCKET_SERVER = `https://api.${Constants.DOMAIN_NAME}`;
        }
        else if (Constants.ENV == Constants.ENV_DEV) {
            this.SOCKET_SERVER = `https://devapi.${Constants.DOMAIN_NAME}`;
        }
        else if (Constants.ENV == Constants.ENV_LOCAL) {
            this.SOCKET_SERVER = `http://localhost:8200`;
        }

        // Order Status Text
        this.ORDER_STATUS_TEXT[this.ORDER_STATUS.APPROVED] = 'Approved';
        this.ORDER_STATUS_TEXT[this.ORDER_STATUS.ACCEPTED] = 'Accepted';
        this.ORDER_STATUS_TEXT[this.ORDER_STATUS.CANCELLED_BY_REST] = 'Cancelled by Restaurant';
        this.ORDER_STATUS_TEXT[this.ORDER_STATUS.QUEUE_ADDED] = 'Added in Queue';

        // Card Months
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        for (var i = 0; i < monthNames.length; i++) {
            this.CARD_MONTHS.push({
                label: monthNames[i],
                value: (i + 1),
            });
        }

        // Card Years
        var currentYear = (new Date()).getFullYear();

        for (var i = 0; i <= 10; i++) {
            var year = currentYear + i;

            this.CARD_YEARS.push({
                label: year,
                value: `${year}`.substr(2),
            });
        }

        // Pricing
        this.PRICING_ID[this.PRICING_TITLE_MARKETPLACE] = this.PRICING_MARKETPLACE;
        this.PRICING_ID[this.PRICING_TITLE_PLATFORM] = this.PRICING_PLATFORM;
        this.PRICING_ID[this.PRICING_TITLE_COMBO] = this.PRICING_COMBO;

        this.PRICING_TITLE[this.PRICING_MARKETPLACE] = this.PRICING_TITLE_MARKETPLACE;
        this.PRICING_TITLE[this.PRICING_PLATFORM] = this.PRICING_TITLE_PLATFORM;
        this.PRICING_TITLE[this.PRICING_COMBO] = this.PRICING_TITLE_COMBO;
    }
}