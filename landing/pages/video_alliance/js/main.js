/* Рендер data-driven секций + мобильное меню. Грузится с defer, после data.js. */
(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var data = window.SITE_DATA || {};

  /* Общий рендер списка преимуществ.
     Секции hero/turnkey/projects используют одинаковую структуру <li>,
     отличаясь только классами и разделителем title/text. */
  function renderAdvantages(containerId, items, opts) {
    var el = document.getElementById(containerId);
    if (!el || !items) return;
    el.innerHTML = items.map(function (a) {
      return '<li class="' + opts.itemClass + '">'
        + '<span class="' + opts.iconClass + '" aria-hidden="true">' + escapeHtml(a.icon) + '</span>'
        + '<div><strong>' + escapeHtml(a.title) + '</strong>' + opts.separator + escapeHtml(a.text) + '</div>'
        + '</li>';
    }).join("");
  }

  /* --- Hero: преимущества --- */
  renderAdvantages("hero-advantages-list", data.heroAdvantages, {
    itemClass: "hero-adv-item", iconClass: "hero-adv-icon", separator: " — "
  });

  /* --- Hero: badges (оплата / рассрочка) --- */
  var heroBadgesEl = document.getElementById("hero-badges-list");
  if (heroBadgesEl && data.heroBadges) {
    heroBadgesEl.innerHTML = data.heroBadges.map(function (b) {
      return '<li class="hero-badge">'
        + '<strong class="hero-badge-title">' + escapeHtml(b.title) + '</strong>'
        + '<p class="hero-badge-text">' + escapeHtml(b.text) + '</p>'
        + '</li>';
    }).join("");
  }

  /* --- Turnkey: преимущества --- */
  renderAdvantages("turnkey-advantages-list", data.turnkeyAdvantages, {
    itemClass: "tk-adv-item", iconClass: "tk-adv-icon", separator: " — "
  });

  /* --- Turnkey: услуги --- */
  var servicesEl = document.getElementById("services-list");
  if (servicesEl && data.services) {
    servicesEl.innerHTML = data.services.map(function (s) {
      return '<li class="service-item">'
        + '<span class="service-emoji" aria-hidden="true">' + escapeHtml(s.emoji) + '</span>'
        + '<span class="service-title">' + escapeHtml(s.title) + '</span>'
        + '<span class="service-arrow">›</span>'
        + '</li>';
    }).join("");
  }

  /* --- Проекты: преимущества (разделитель — перенос строки) --- */
  renderAdvantages("project-advantages-list", data.projectAdvantages, {
    itemClass: "proj-adv-item", iconClass: "proj-adv-icon", separator: "<br>"
  });

  /* --- Кейс --- */
  var caseEl = document.getElementById("case-block");
  if (caseEl && data.projectCase) {
    var c = data.projectCase;
    var metricsHtml = c.metrics.map(function (m) {
      return '<div class="case-metric">'
        + '<span class="case-metric-value">' + escapeHtml(m.value) + '</span>'
        + (m.label ? '<span class="case-metric-label">' + escapeHtml(m.label) + '</span>' : '')
        + '</div>';
    }).join("");
    caseEl.innerHTML = '<div class="case-header">'
      + '<span class="case-client">' + escapeHtml(c.client) + '</span>'
      + '</div>'
      + '<h3 class="case-title">' + escapeHtml(c.title) + '</h3>'
      + '<p class="case-text">' + escapeHtml(c.text) + '</p>'
      + '<div class="case-metrics">' + metricsHtml + '</div>';
  }

  /* --- Клиенты (логотипы) --- */
  var clientsEl = document.getElementById("clients-list");
  if (clientsEl && data.clients) {
    /* Удвоим массив для бесшовного бегущего ряда */
    var doubled = data.clients.concat(data.clients);
    clientsEl.innerHTML = doubled.map(function (cl) {
      return '<li class="client-logo">'
        + '<span class="client-logo-text">' + escapeHtml(cl.name) + '</span>'
        + '</li>';
    }).join("");
  }

  /* --- Мобильное меню (бургер) --- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".header-nav");
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

  /* --- Слайдер клиентов (стрелки) --- */
  var slider = document.getElementById("clients-list");
  var btnPrev = document.querySelector(".clients-prev");
  var btnNext = document.querySelector(".clients-next");
  if (slider && btnPrev && btnNext) {
    var offset = 0;
    var step = 180; // ширина карточки (.client-logo 160px) + gap трека (.clients-track 20px)

    function move(delta) {
      /* Прокручиваемый диапазон = ширина трека минус видимая область.
         Ограничиваем offset в [-(maxOffset), 0], чтобы нельзя было укрутить в бесконечность. */
      var viewport = slider.parentElement ? slider.parentElement.clientWidth : 0;
      var maxOffset = Math.max(0, slider.scrollWidth - viewport);
      offset = Math.min(0, Math.max(-maxOffset, offset + delta));
      slider.style.transform = "translateX(" + offset + "px)";
    }

    btnNext.addEventListener("click", function () { move(-step); });
    btnPrev.addEventListener("click", function () { move(step); });
  }

})();
