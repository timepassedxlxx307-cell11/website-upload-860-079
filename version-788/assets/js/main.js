(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobile.classList.toggle("is-open");
            toggle.textContent = mobile.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initFiltering() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        if (!input || cards.length === 0) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }
        function applyFilter() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var source = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.style.display = source.indexOf(query) === -1 ? "none" : "";
            });
        }
        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    window.initVideoPlayer = function (source) {
        var video = document.querySelector(".player-video");
        var overlay = document.querySelector(".player-overlay");
        var startButton = document.querySelector(".player-start");
        var hls = null;
        var prepared = false;
        if (!video || !overlay || !startButton || !source) {
            return;
        }
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }
        function play() {
            prepare();
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", play);
        startButton.addEventListener("click", function (event) {
            event.stopPropagation();
            play();
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHeroSlider();
        initFiltering();
    });
})();
