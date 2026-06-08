(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 0) {
            var index = 0;
            var showSlide = function (nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        var queryInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var resultCount = document.querySelector("[data-result-count]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (queryInput) {
            queryInput.value = query;
        }

        var applyFilter = function () {
            if (!queryInput || cards.length === 0) {
                return;
            }
            var value = queryInput.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var visible = value.length === 0 || haystack.indexOf(value) !== -1;
                card.classList.toggle("hidden-by-filter", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (resultCount) {
                resultCount.textContent = String(shown);
            }
        };

        if (queryInput) {
            queryInput.addEventListener("input", applyFilter);
            applyFilter();
        }
    });
})();
