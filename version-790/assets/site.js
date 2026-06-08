(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var pageRoot = scope.parentElement || document;
      var searchInput = scope.querySelector('[data-search-input]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var regionSelect = scope.querySelector('[data-filter-region]');
      var visibleCount = scope.querySelector('[data-visible-count]');
      var cards = Array.prototype.slice.call(pageRoot.querySelectorAll('[data-movie-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var query = normalize(searchInput && searchInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags
          ].join(' '));
          var cardType = normalize(card.dataset.type);
          var cardRegion = normalize(card.dataset.region);
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var matchRegion = !region || cardRegion.indexOf(region) !== -1;
          var visible = matchQuery && matchType && matchRegion;

          card.classList.toggle('is-filtered-out', !visible);

          if (visible) {
            shown += 1;
          }
        });

        if (visibleCount) {
          visibleCount.textContent = String(shown);
        }
      }

      [searchInput, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
