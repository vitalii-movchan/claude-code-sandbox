/* Renders data-driven sections + mobile menu. Loaded with defer, after data.js. */
(function () {
  "use strict";

  const data = window.SITE_DATA || {};

  /* Inline icons used in the top bar / footer contacts */
  const ICONS = {
    phone: '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11 11 0 0 0 3.5.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .6 3.5 1 1 0 0 1-.3 1z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V6h2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  };

  /* Top bar info */
  render("topbar-list", data.topbar, (i) => `
    <li><span class="ti-icon" aria-hidden="true">${ICONS[i.icon] || ""}</span>${escapeHtml(i.text)}</li>`);

  /* Top bar social */
  render("topsocial-list", data.social, socialLink);

  /* Experience features */
  render("expfeatures-list", data.expFeatures, (f) => `
    <li class="exp-feature">
      <span class="exp-feature-icon" aria-hidden="true">&#10003;</span>
      <div>
        <h4>${escapeHtml(f.title)}</h4>
        <p>${escapeHtml(f.text)}</p>
      </div>
    </li>`);

  /* Services */
  render("services-list", data.services, (s) => `
    <li class="service-card">
      <div class="service-img img-placeholder" data-bg="${encodeURI(s.img)}" role="img" aria-label="${escapeHtml(s.title)}"></div>
      <div class="service-body">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.text)}</p>
        <a href="#quote" class="btn btn-accent btn-sm">Read More</a>
      </div>
    </li>`);

  /* About stat cards */
  render("stats-list", data.stats, (s) => `
    <li class="stat stat-${escapeHtml(s.tone)}">
      <span class="stat-number">${escapeHtml(s.number)}</span>
      <span class="stat-label">${escapeHtml(s.label)}</span>
    </li>`);

  /* About / Mission columns */
  render("about-list", data.about, (a) => `
    <li class="about-col">
      <h3>${escapeHtml(a.title)}</h3>
      <span class="title-rule small left"></span>
      <p>${escapeHtml(a.text)}</p>
      <a href="#quote" class="about-more">Read More &rsaquo;</a>
    </li>`);

  /* Testimonials */
  render("testimonials-list", data.testimonials, (t) => `
    <li class="testimonial-item">
      <blockquote class="testimonial">
        <p>&ldquo;${escapeHtml(t.text)}&rdquo;</p>
        <footer><span class="t-author">${escapeHtml(t.author)}</span><span class="t-role">${escapeHtml(t.role)}</span></footer>
      </blockquote>
    </li>`);

  /* Client logos */
  render("clients-list", data.clients, (c) => `
    <li class="client">${escapeHtml(c)}</li>`);

  /* Team */
  render("team-list", data.team, (m) => `
    <li class="member">
      <div class="member-img img-placeholder" data-bg="${encodeURI(m.img)}" role="img" aria-label="${escapeHtml(m.name)}"></div>
      <div class="member-body">
        <h3>${escapeHtml(m.name)}</h3>
        <p>${escapeHtml(m.role)}</p>
        <div class="member-social">${(data.social || []).map(socialLink).join("")}</div>
      </div>
    </li>`);

  /* Blog */
  render("blog-list", data.blog, (b) => `
    <li class="post">
      <div class="post-img img-placeholder" data-bg="${encodeURI(b.img)}" role="img" aria-label="${escapeHtml(b.title)}"></div>
      <div class="post-body">
        <span class="post-meta">${escapeHtml(b.date)} &middot; by ${escapeHtml(b.author)}</span>
        <h3>${escapeHtml(b.title)}</h3>
        <a href="#blog" class="post-more">Continue Reading &rsaquo;</a>
      </div>
    </li>`);

  /* Footer */
  render("footsocial-list", data.social, socialLink);
  render("footlinks1-list", data.footLinks1, (l) => `<li><a href="#top">${escapeHtml(l)}</a></li>`);
  render("footlinks2-list", data.footLinks2, (l) => `<li><a href="#services">${escapeHtml(l)}</a></li>`);
  render("footcontact-list", data.footContact, (c) => `
    <li><span class="fc-icon" aria-hidden="true">${ICONS[c.icon] || ""}</span>${escapeHtml(c.text)}</li>`);

  /* ---- helpers ---- */

  function socialLink(s) {
    return `<a class="social-link" href="${encodeURI(s.href)}" aria-label="${escapeHtml(s.label)}">${escapeHtml(s.glyph)}</a>`;
  }

  /* Generic: container id → array → innerHTML */
  function render(id, arr, tpl) {
    const el = document.getElementById(id);
    if (el && Array.isArray(arr)) {
      el.innerHTML = arr.map(tpl).join("");
    }
  }

  /* Graceful image fallback: preload each [data-bg]; only apply it as the
     background once it actually loads. Missing/404 files leave the element's
     CSS placeholder (gradient + glyph) in place instead of an empty block. */
  function loadBackgrounds() {
    document.querySelectorAll("[data-bg]").forEach((el) => {
      const url = el.getAttribute("data-bg");
      if (!url) return;
      const probe = new Image();
      probe.onload = () => {
        el.style.backgroundImage = 'url("' + url + '")';
        el.classList.add("has-img");
      };
      probe.onerror = () => {
        console.warn("Background image failed to load: " + url);
      };
      probe.src = url;
    });
  }
  loadBackgrounds();

  /* Mobile burger menu */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Escape strings before innerHTML insertion — always. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
