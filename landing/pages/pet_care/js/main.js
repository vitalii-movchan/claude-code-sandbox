/* Pawsome Pet Care — рендер data-driven секций + интерактив.
   Грузится с defer, строго после data.js. */
(function () {
  "use strict";

  const data = window.SITE_DATA || {};

  /* --- Утилита экранирования --- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* --- Graceful-фолбэк для фото ---
     Пути к фото лежат в SITE_DATA.media; каждое предзагружаем и ставим фоном
     ТОЛЬКО после успешной загрузки. Нет файла → остаётся оформленная заглушка
     (градиент + emoji через ::before), без битых картинок и ошибок в консоли. */
  var MEDIA_TARGETS = { hero: "hero-photo", vets: "vets-photo", footer: "footer-photo" };
  (function loadMedia() {
    var media = data.media || {};
    Object.keys(MEDIA_TARGETS).forEach(function (key) {
      var url = media[key];
      var el = document.getElementById(MEDIA_TARGETS[key]);
      if (!url || !el) return;
      var probe = new Image();
      probe.onload = function () {
        el.style.backgroundImage = "url('" + encodeURI(url) + "')";
        el.classList.add("has-img");
      };
      probe.src = encodeURI(url);
    });
  })();

  /* --- Генерация звёзд --- */
  function renderStars(count, max) {
    max = max || 5;
    let html = "";
    for (let i = 1; i <= max; i++) {
      html += i <= count
        ? '<span class="star star--filled">&#9733;</span>'
        : '<span class="star star--empty">&#9733;</span>';
    }
    return html;
  }

  /* --- Рендер карточек услуг (карусель) --- */
  var servicesEl = document.getElementById("services-list");
  if (servicesEl && data.services) {
    servicesEl.innerHTML = data.services
      .map(function (s, i) {
        return '<div class="service-card' + (i === 0 ? " service-card--active" : "") + '" data-index="' + i + '">'
          + '<div class="service-card__image">'
          + '<div class="service-card__avatar">' + escapeHtml(s.emoji) + '</div>'
          + '</div>'
          + '<div class="service-card__title">' + escapeHtml(s.title) + '</div>'
          + '</div>';
      })
      .join("");
  }

  /* --- Dots индикаторы карусели --- */
  var dotsEl = document.getElementById("services-dots");
  var currentSlide = 0;
  var cardsPerView = 2;

  function getCardsPerView() {
    return window.innerWidth < 600 ? 1 : 2;
  }

  function updateCarousel() {
    cardsPerView = getCardsPerView();
    var cards = document.querySelectorAll(".service-card");
    var totalSlides = Math.ceil(cards.length / cardsPerView);
    if (currentSlide >= totalSlides) currentSlide = totalSlides - 1;

    cards.forEach(function (card, idx) {
      var slideIdx = Math.floor(idx / cardsPerView);
      card.style.display = slideIdx === currentSlide ? "flex" : "none";
    });

    if (dotsEl) {
      var dots = dotsEl.querySelectorAll(".carousel-dot");
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("carousel-dot--active", idx === currentSlide);
      });
    }
  }

  if (dotsEl && data.services) {
    cardsPerView = getCardsPerView();
    var totalDots = Math.ceil(data.services.length / cardsPerView);
    dotsEl.innerHTML = Array.from({ length: totalDots }, function (_, i) {
      return '<button class="carousel-dot' + (i === 0 ? " carousel-dot--active" : "") + '" aria-label="Slide ' + (i + 1) + '" data-dot="' + i + '"></button>';
    }).join("");

    dotsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".carousel-dot");
      if (btn) {
        currentSlide = parseInt(btn.getAttribute("data-dot"), 10);
        updateCarousel();
      }
    });
  }

  updateCarousel();
  window.addEventListener("resize", function () {
    cardsPerView = getCardsPerView();
    var newTotal = Math.ceil((data.services || []).length / cardsPerView);
    if (dotsEl) {
      dotsEl.innerHTML = Array.from({ length: newTotal }, function (_, i) {
        return '<button class="carousel-dot' + (i === currentSlide ? " carousel-dot--active" : "") + '" aria-label="Slide ' + (i + 1) + '" data-dot="' + i + '"></button>';
      }).join("");
      dotsEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".carousel-dot");
        if (btn) {
          currentSlide = parseInt(btn.getAttribute("data-dot"), 10);
          updateCarousel();
        }
      });
    }
    updateCarousel();
  });

  /* --- Рендер отзывов --- */
  var reviewsEl = document.getElementById("reviews-list");
  if (reviewsEl && data.reviews) {
    reviewsEl.innerHTML = data.reviews
      .map(function (r) {
        return '<div class="review-card' + (r.featured ? " review-card--featured" : "") + '">'
          + '<div class="review-card__avatar-wrap">'
          + '<div class="review-card__avatar">' + escapeHtml(r.avatar) + '</div>'
          + '</div>'
          + '<div class="review-card__name">' + escapeHtml(r.name) + '</div>'
          + '<p class="review-card__text">' + escapeHtml(r.text) + '</p>'
          + '<div class="review-card__stars">' + renderStars(r.stars, 5) + '</div>'
          + '</div>';
      })
      .join("");
  }

  /* --- Рендер ссылок футера --- */
  var footerLeftEl = document.getElementById("footer-links-left");
  var footerRightEl = document.getElementById("footer-links-right");

  if (data.footerLinks) {
    data.footerLinks.forEach(function (col) {
      var el = col.column === "left" ? footerLeftEl : footerRightEl;
      if (el) {
        el.innerHTML = col.links
          .map(function (link) {
            return '<li><a href="' + escapeHtml(link.href) + '">' + escapeHtml(link.label) + '</a></li>';
          })
          .join("");
      }
    });
  }

  /* --- Мобильное меню --- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav__links");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

})();
