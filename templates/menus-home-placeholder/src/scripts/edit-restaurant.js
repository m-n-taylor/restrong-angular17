$(function () {
    var pageClass = '.edit-restaurant-page';

    // ONLY runs code in edit-restaurant page
    if ($(pageClass).length > 0) {

        /**
         * Restaurant Info tab
         */
        var restRightNav = $(pageClass + ' .rest-info-tab-pane .rest-right-nav');

        $(window).scroll(checkWindowScroll);

        checkWindowScroll();

        function checkWindowScroll() {
            var scrollTop = $(window).scrollTop();

            if (scrollTop > 330) {
                restRightNav.addClass('fixed-nav');
            }
            else {
                restRightNav.removeClass('fixed-nav');
            }

            $('#restaurant-details-section, #restaurant-address-section, #restaurant-contacts-section, #contact-details-section, #account-information-section, #tax-settings-section, #service-type-section, #working-hours-section, #delivery-hours-section').each(function () {
                var topDistance = $(this).offset().top;

                if ((topDistance - 100) < scrollTop) {
                    $('.rest-info-tab-pane .rest-right-nav a .rest-nav-item').removeClass('active');

                    var _id = $(this).attr('id');

                    $('a[href="#' + _id + '"]').children('.rest-nav-item').addClass('active');
                    // console.log('href link', 'a[href="#' + _id + '"]');

                    //$(this).children('.rest-nav-item').addClass('active');
                }

                // console.log('scrollTop', scrollTop, 'topDistance', topDistance);
            });
        }

        $(document).on('click', '.rest-info-tab-pane .rest-right-nav a.smooth-scroll', function (event) {
            event.preventDefault();

            // $('.rest-info-tab-pane .rest-right-nav a .rest-nav-item').removeClass('active');

            // $(this).children('.rest-nav-item').addClass('active');

            $('html, body').animate({
                scrollTop: $($.attr(this, 'href')).offset().top - 50
            }, 0);
        });

        /**
         * Orders tab
         */
        $("[data-show-orders-filters]").click(function (event) {
            var shouldShow = $(this).attr('data-show-orders-filters');

            if (shouldShow == 'true') {
                $('.orders-tab-pane .customer-order-search').addClass('filters-active');
            }
            else {
                $('.orders-tab-pane .customer-order-search').removeClass('filters-active');
            }

            console.log('orders filters clicked', shouldShow);
        });


        /**
         * Preview tab
         */
        $('.menu-section-heading .collapse-toggle').on('click', function (event) {
            event.stopPropagation();
            $(this).closest('.menu-section').toggleClass('collapsed');

            toggleCollapseIcons($(this));

            console.log('.menu-item-section .collapse-toggle clicked');
        });

        $('.menu-item-section-heading .collapse-toggle').on('click', function (event) {
            event.stopPropagation();
            $(this).closest('.menu-item-section').toggleClass('collapsed');

            toggleCollapseIcons($(this));

            console.log('.menu-item-section .collapse-toggle clicked');
        });

        function toggleCollapseIcons(element) {
            if (element.hasClass('close-icon')) {
                element.removeClass('close-icon');
                element.addClass('open-icon');
            }
            else {
                element.removeClass('open-icon');
                element.addClass('close-icon');
            }
        }

        console.log('edit-restaurant page');
    }
});