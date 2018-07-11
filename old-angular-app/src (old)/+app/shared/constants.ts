/**
 * Constants
 */
declare var google;

export class Constants {
    public static DEBUG = true;
    public SERVER_URL = 'https://dev.menus.com';
    public API_URL = this.SERVER_URL + '/api';
    public API_KEY = 'API_TEST_KEY';

    // public SERVICE_TYPE_DINEIN = 1;
    // public SERVICE_TYPE_CATERING = 2;
    // public SERVICE_TYPE_DELIVERY = 3;
    // public SERVICE_TYPE_PICKUP = 4;

    public MODE_CREATE = 1;
    public MODE_UPDATE = 2;

    // Service Types (string)
    public SERVICE_TYPE_DINEIN = 'dine-in';
    public SERVICE_TYPE_CATERING = 'catering';
    public SERVICE_TYPE_DELIVERY = 'delivery';
    public SERVICE_TYPE_PICKUP = 'pick-up';

    // Page Tabs
    public PAGE_TAB_DISH = 'dish';
    public PAGE_TAB_RESTAURANT = 'restaurant';

    // Delivery Modes
    public DELIVERY_MODE_SCHLEP_FETCH = 4;

    // Keywords Type
    public KEYWORD_NONE = -1;
    public KEYWORD_TYPE_MENU_ITEM = 0;
    public KEYWORD_TYPE_CUISINE = 1;
    public KEYWORD_TYPE_DISH = 2;
    public KEYWORD_TYPE_RESTAURANT = 3;

    public KEYWORD_SEPRATOR = '|';

    public SERVICE_TYPE_ID = {};

    public DEFAULT_MAP_OPTIONS = {
        draggable: true,
        streetViewControl: false,
        zoom: 12,
        mapTypeId: typeof google !== 'undefined' && google ? google.maps.MapTypeId.ROADMAP : {},
        mapTypeControl: false,
        clickableIcons: false,
        disableDefaultUI: true,
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

    constructor() {
        // Service Types (number)
        this.SERVICE_TYPE_ID['dine-in'] = 1;
        this.SERVICE_TYPE_ID['catering'] = 2;
        this.SERVICE_TYPE_ID['delivery'] = 3;
        this.SERVICE_TYPE_ID['pick-up'] = 4;
    }
}