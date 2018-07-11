(function () {
    'use strict';

    // window['APP_CONFIG'] = {
    //     'LocationStrategy': 'Hash'
    // };

    // if (!window.location.hash || window.location.hash.length == 0) {
    //     window.location.hash = 'backoffice/login';
    // }

    // window.addEventListener('load', function () {
    //     console.log('hello mobile app bundle');

        document.addEventListener("deviceready", function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                // cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        }, false);
    // });
})();