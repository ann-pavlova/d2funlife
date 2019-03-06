$(function () {
    //burger
    (function($burger) {
        if (!$burger.length) {
            return;
        }

        $burger.on('click', function() {
            $('.b-menu__wrapper').show();

            setTimeout(function() {
                $('.b-menu__wrap').addClass('is-open');
                if(window.innerWidth < 670) {
                    setTimeout(function () {
                        $('body').addClass('is-open-menu');
                    }, 200);
                }
            }, 100);
        });
    })($('.j-burger'));

    (function($burgerClose) {
        if (!$burgerClose.length) {
            return;
        }

        if(window.innerWidth > 670) {
            $burgerClose.parents('.b-menu__wrapper').on('click', function () {
                $('.b-menu__wrap').removeClass('is-open');
                setTimeout(function () {
                    $('.b-menu__wrapper').hide();
                }, 200);
            });
        }

        $burgerClose.on('click', function() {
            setTimeout(function() {
                $('.b-menu__wrapper').hide();
            }, 200);
            $('.b-menu__wrap').removeClass('is-open');
            $('body').removeClass('is-open-menu');
        });
    })($('.j-burger-close'));

    //search
    let searchField = $('.search');
    let searchInput = $('.search input');

    let checkSearch = function() {
        let contents = searchInput.val();
        if (contents.length !== 0) {
            searchField.addClass('full');
        } else {
            searchField.removeClass('full');
        }
    };

    $('.search input').focus(function() {
        searchField.addClass('is-active');
    }).blur(function() {
        searchField.removeClass('is-active');
        checkSearch();
    });

    //back to top
    $(document).ready(function() {
        let offset = 220;
        let duration = 300;

        $(window).scroll(function() {
            if ($(this).scrollTop() > offset) {
                $('.j-btn-top').fadeIn(duration);
            } else {
                $('.j-btn-top').fadeOut(duration);
            }
        });

        $('.j-btn-top').click(function(e) {
            e.preventDefault();
            $('html, body').animate({scrollTop: 0}, duration);
            return false;
        });
    });

    $(document).ready(function() {
        let contr = $('.j-masonry');
        contr.imagesLoaded(function () {
            contr.masonry({
                itemSelector: '.b-post',
                columnWidth: '.b-post',
                horizontalOrder: true
            });
        });
    });

    $(document).ready(function() {

        $('.b-single-post__gallery').on('click', function(event) {
            event.preventDefault();

            let gallery = $(this).attr('href');

            $(gallery).magnificPopup({
                delegate: 'a',
                type:'image',
                gallery: {
                    enabled: true
                }
            }).magnificPopup('open');
        });

    });
});
