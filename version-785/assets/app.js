(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function createElement(tag, className, value) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (value) {
      element.textContent = value;
    }
    return element;
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      if (slides.length <= 1) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      start();
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-grid]").forEach(function (grid) {
      var section = grid.closest("main");
      var input = section ? section.querySelector(".movie-filter") : null;
      var chips = section ? Array.prototype.slice.call(section.querySelectorAll(".filter-chip")) : [];
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-filter-card"));
      var selected = "";
      function run() {
        var keyword = text(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedChip = !selected || haystack.indexOf(text(selected)) !== -1;
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedChip));
        });
      }
      if (input) {
        input.addEventListener("input", run);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          selected = chip.getAttribute("data-filter-value") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          run();
        });
      });
    });
  }

  function movieCard(item) {
    var article = createElement("article", "movie-card compact");
    var poster = createElement("a", "poster-link");
    poster.href = item.url;
    var image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";
    var year = createElement("span", "year-badge", item.year);
    var play = createElement("span", "play-badge", "▶");
    poster.appendChild(image);
    poster.appendChild(year);
    poster.appendChild(play);
    var body = createElement("div", "card-body");
    var title = createElement("h2");
    var link = createElement("a", "", item.title);
    link.href = item.url;
    title.appendChild(link);
    var meta = createElement("p", "card-meta", [item.region, item.type, item.genre].join(" · "));
    var line = createElement("p", "card-line", item.oneLine);
    var tags = createElement("div", "tag-row");
    (item.tags || []).slice(0, 4).forEach(function (tag) {
      tags.appendChild(createElement("span", "", tag));
    });
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(line);
    body.appendChild(tags);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function setupSearchPage() {
    var input = document.getElementById("site-search-input");
    var results = document.getElementById("search-results");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    function render(value) {
      var keyword = text(value);
      results.innerHTML = "";
      var matches = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return false;
        }
        return text([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ")).indexOf(keyword) !== -1;
      }).slice(0, 120);
      matches.forEach(function (item) {
        results.appendChild(movieCard(item));
      });
      if (keyword && matches.length === 0) {
        var empty = createElement("div", "story-card");
        var title = createElement("h2", "", "没有找到相关影片");
        var body = createElement("p", "", "换一个片名、地区、年份或类型关键词再试试。");
        empty.appendChild(title);
        empty.appendChild(body);
        results.appendChild(empty);
      }
    }
    render(query);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, videoUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !videoUrl) {
      return;
    }
    var hlsInstance = null;
    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }
    function start() {
      attach();
      overlay.hidden = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.hidden = false;
        });
      }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.hidden = true;
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
