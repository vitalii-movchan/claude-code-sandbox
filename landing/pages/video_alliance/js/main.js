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

  /* --- Hero: преимущества --- */
  var heroAdvEl = document.getElementById("hero-advantages-list");
  if (heroAdvEl && data.heroAdvantages) {
    heroAdvEl.innerHTML = data.heroAdvantages.map(function (a) {
      return '<li class="hero-adv-item">'
        + '<span class="hero-adv-icon">' + escapeHtml(a.icon) + '</span>'
        + '<div><strong>' + escapeHtml(a.title) + '</strong> — ' + escapeHtml(a.text) + '</div>'
        + '</li>';
    }).join("");
  }

  /* --- Hero: badges (оплата / рассрочка) --- */
  var heroBadgesEl = document.getElementById("hero-badges-list");
  if (heroBadgesEl && data.heroBadges) {
    heroBadgesEl.innerHTML = data.heroBadges.map(function (b) {
      return '<div class="hero-badge">'
        + '<strong class="hero-badge-title">' + escapeHtml(b.title) + '</strong>'
        + '<p class="hero-badge-text">' + escapeHtml(b.text) + '</p>'
        + '</div>';
    }).join("");
  }

  /* --- Turnkey: преимущества --- */
  var tkAdvEl = document.getElementById("turnkey-advantages-list");
  if (tkAdvEl && data.turnkeyAdvantages) {
    tkAdvEl.innerHTML = data.turnkeyAdvantages.map(function (a) {
      return '<li class="tk-adv-item">'
        + '<span class="tk-adv-icon">' + escapeHtml(a.icon) + '</span>'
        + '<div><strong>' + escapeHtml(a.title) + '</strong> — ' + escapeHtml(a.text) + '</div>'
        + '</li>';
    }).join("");
  }

  /* --- Turnkey: услуги --- */
  var servicesEl = document.getElementById("services-list");
  if (servicesEl && data.services) {
    servicesEl.innerHTML = data.services.map(function (s) {
      return '<div class="service-item">'
        + '<span class="service-emoji">' + escapeHtml(s.emoji) + '</span>'
        + '<span class="service-title">' + escapeHtml(s.title) + '</span>'
        + '<span class="service-arrow">›</span>'
        + '</div>';
    }).join("");
  }

  /* --- Проекты: преимущества --- */
  var projAdvEl = document.getElementById("project-advantages-list");
  if (projAdvEl && data.projectAdvantages) {
    projAdvEl.innerHTML = data.projectAdvantages.map(function (a) {
      return '<li class="proj-adv-item">'
        + '<span class="proj-adv-icon">' + escapeHtml(a.icon) + '</span>'
        + '<div><strong>' + escapeHtml(a.title) + '</strong><br>' + escapeHtml(a.text) + '</div>'
        + '</li>';
    }).join("");
  }

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
      return '<div class="client-logo">'
        + '<span class="client-logo-text">' + escapeHtml(cl.name) + '</span>'
        + '</div>';
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
    var step = 180;
    btnNext.addEventListener("click", function () {
      offset -= step;
      slider.style.transform = "translateX(" + offset + "px)";
    });
    btnPrev.addEventListener("click", function () {
      offset += step;
      slider.style.transform = "translateX(" + offset + "px)";
    });
  }

})();
