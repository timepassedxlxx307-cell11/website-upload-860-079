(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var clear = document.querySelector("[data-clear-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || !cards.length) return;
    function filter() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
      });
    }
    input.addEventListener("input", filter);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        filter();
        input.focus();
      });
    }
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    if (prev) prev.addEventListener("click", function () { show(current - 1); });
    if (next) next.addEventListener("click", function () { show(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });
    if (slides.length > 1) {
      setInterval(function () { show(current + 1); }, 5600);
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !source) return;
    var attached = false;
    function attach() {
      if (attached) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }
    function start() {
      attach();
      video.controls = true;
      if (cover) cover.classList.add("is-hidden");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }
    if (cover) cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!attached || video.paused) start();
    });
  };

  ready(function () {
    setupMenu();
    setupSearch();
    setupHero();
  });
})();
