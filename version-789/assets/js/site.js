(function () {
    function initNavigation() {
        var button = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }

            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-hero-dot') || 0);
                activate(next);
                reset();
            });
        });

        activate(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var region = scope.querySelector('[data-filter-select="region"]');
            var type = scope.querySelector('[data-filter-select="type"]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
            var result = scope.querySelector('[data-filter-result]');

            if (!input && !region && !type) {
                return;
            }

            function applyFilter() {
                var keyword = normalize(input ? input.value : '');
                var regionValue = normalize(region ? region.value : '');
                var typeValue = normalize(type ? type.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                    var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    var shouldShow = matchKeyword && matchRegion && matchType;

                    card.classList.toggle('is-hidden', !shouldShow);

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '当前显示 ' + visible + ' 部影片';
                }
            }

            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });

            applyFilter();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHeroSlider();
        initFilters();
    });
})();
