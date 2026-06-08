(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function move(step) {
      showSlide(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
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
        showSlide(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  var panel = document.querySelector('[data-filter-panel]');

  if (panel) {
    var searchInput = panel.querySelector('[data-movie-search]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var clearButton = panel.querySelector('[data-clear-search]');
    var resultCount = panel.querySelector('[data-result-count]');
    var tagButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
    var quickTag = '';
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var typeValue = normalize(typeFilter ? typeFilter.value : '');
      var yearValue = normalize(yearFilter ? yearFilter.value : '');
      var tagValue = normalize(quickTag);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-filter'));
        var type = normalize(card.getAttribute('data-type'));
        var year = normalize(card.getAttribute('data-year'));
        var genre = normalize(card.getAttribute('data-genre'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (typeValue && type !== typeValue) {
          matched = false;
        }

        if (yearValue && year !== yearValue) {
          matched = false;
        }

        if (tagValue && genre.indexOf(tagValue) === -1 && haystack.indexOf(tagValue) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        quickTag = '';
        tagButtons.forEach(function (button) {
          button.classList.toggle('active', button.getAttribute('data-filter-button') === '');
        });
        applyFilters();
      });
    }

    tagButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        quickTag = button.getAttribute('data-filter-button') || '';
        tagButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }
}());
