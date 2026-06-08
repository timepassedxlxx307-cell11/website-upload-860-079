document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var targetSelector = input.getAttribute('data-search-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    var empty = input.closest('.search-panel') ? input.closest('.search-panel').querySelector('[data-empty-message]') : null;

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  });
});
