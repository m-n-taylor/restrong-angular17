$(function () {
    var pageClass = '.support-page';

    // ONLY runs code in edit-restaurant page
    if ($(pageClass).length > 0) {

        /**
         * FAQ section
         */
        $('.faq-item .collapse-toggle').on('click', function (event) {
            event.stopPropagation();
            $(this).closest('.faq-item').toggleClass('collapsed');

            toggleCollapseIcons($(this));

            console.log('.faq-item .collapse-toggle clicked');
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
        

        console.log(pageClass + ' page');
    }
});