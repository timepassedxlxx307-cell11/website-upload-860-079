
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupCategoryFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var text = panel.querySelector("[data-filter-text]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

      function apply() {
        var query = normalize(text && text.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" "));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
          var matchRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
          card.hidden = !(matchQuery && matchYear && matchRegion);
        });
      }

      [text, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class="movie-card" href="" + escapeHtml(item.url) + "">",
      "<span class="card-poster">",
      "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
      "<span class="card-play" aria-hidden="true">▶</span>",
      "<span class="card-badge">" + escapeHtml(item.year) + "</span>",
      "</span>",
      "<span class="card-info">",
      "<strong>" + escapeHtml(item.title) + "</strong>",
      "<em>" + escapeHtml(item.oneLine) + "</em>",
      "<span class="card-meta">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</span>",
      "<span class="card-tags">" + tags + "</span>",
      "</span>",
      "</a>"
    ].join("");
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_INDEX) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var category = page.querySelector("[data-search-category]");
    var button = page.querySelector("[data-search-button]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && input) {
      input.value = params.get("q");
    }

    function apply() {
      var query = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var text = normalize([
          item.title,
          item.category,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" "));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = !selectedCategory || normalize(item.category) === selectedCategory;
        return matchQuery && matchCategory;
      }).slice(0, 80);
      if (title) {
        title.textContent = query || selectedCategory ? "搜索结果" : "精选内容";
      }
      if (results) {
        results.innerHTML = matches.map(buildSearchCard).join("");
      }
    }

    if (button) {
      button.addEventListener("click", apply);
    }
    [input, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var overlay = document.querySelector("[data-player-overlay]");
      if (!video || !streamUrl) {
        return;
      }
      var hlsInstance = null;
      var streamReady = false;

      function attachStream() {
        if (streamReady) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = streamUrl;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
        streamReady = true;
      }

      function play() {
        attachStream();
        video.controls = true;
        if (overlay) {
          overlay.hidden = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.hidden = false;
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      attachStream();
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
  });
})();
