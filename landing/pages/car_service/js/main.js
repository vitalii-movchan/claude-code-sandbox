/* Renders data-driven sections + mobile menu. Loaded with defer, after data.js. */
(function () {
  "use strict";

  const data = window.SITE_DATA || {};

  /* Inline icons for the feature columns */
  const FEATURE_ICONS = {
    gear: '<svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.5H10l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L3.6 11a7.7 7.7 0 0 0 0 2L1.6 14.6l2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M13 3h-2v2.1c-2 .4-3.3 1.7-3.3 3.5 0 2.2 1.9 3 3.9 3.5 1.9.5 2.4.9 2.4 1.7 0 .6-.5 1.3-1.9 1.3-1.5 0-2.2-.7-2.3-1.7H7.5c.1 1.8 1.4 3 3.5 3.4V21h2v-2.1c2.1-.4 3.4-1.7 3.4-3.6 0-2.3-2-3.1-3.9-3.6-1.9-.5-2.4-.9-2.4-1.6 0-.7.6-1.2 1.8-1.2 1.3 0 1.9.6 2 1.5h2.2c-.1-1.7-1.2-2.9-3.1-3.3z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14-3.5-3.5 1.4-1.4L11 13.2l4.6-4.6 1.4 1.4L11 16z"/></svg>',
  };

  /* Inline icons for the contact list */
  const CONTACT_ICONS = {
    pin: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V6h2z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11 11 0 0 0 3.5.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .6 3.5 1 1 0 0 1-.3 1z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',
  };

  /* Each section is a container id + its data array + an item template.
     Looping keeps the seven near-identical render calls DRY. */
  const SECTIONS = [
    {
      id: "features-list",
      data: data.features,
      tpl: (f) => `
    <article class="feature">
      <span class="feature-icon">${FEATURE_ICONS[f.icon] || ""}</span>
      <h3>${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.text)}</p>
    </article>`,
    },
    {
      /* Services — flat list, CSS lays it out in columns */
      id: "services-list",
      data: data.services,
      tpl: (s) => `
    <li class="service-item">${escapeHtml(s)}</li>`,
    },
    {
      id: "reviews-list",
      data: data.reviews,
      tpl: (r) => `
    <article class="review">
      <div class="review-photo" data-bg="${encodeURI(r.photo)}"></div>
      <h3>${escapeHtml(r.title)}</h3>
      <p class="review-text">${escapeHtml(r.text)}</p>
      <p class="review-author">${escapeHtml(r.author)}</p>
    </article>`,
    },
    {
      /* Why-choose checklist */
      id: "why-list",
      data: data.why,
      tpl: (w) => `
    <li><span class="check">&#10003;</span>${escapeHtml(w)}</li>`,
    },
    {
      id: "brands-list",
      data: data.brands,
      tpl: (b) => `
    <span class="brand">${escapeHtml(b)}</span>`,
    },
    {
      id: "contacts-list",
      data: data.contacts,
      tpl: (c) => `
    <li><span class="contact-icon">${CONTACT_ICONS[c.icon] || ""}</span>${escapeHtml(c.text)}</li>`,
    },
    {
      /* Footer social */
      id: "social-list",
      data: data.social,
      tpl: (s) => `
    <a class="social-link" href="${encodeURI(s.href)}" aria-label="${escapeHtml(s.label)}">${escapeHtml(s.glyph)}</a>`,
    },
  ];

  SECTIONS.forEach((section) => render(section.id, section.data, section.tpl));

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
        console.warn("Background image failed to load:", url);
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
    /* Close the mobile menu when resizing up to desktop width
       (mobile nav lives under @media (max-width: 860px) in styles.css). */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860 && nav.classList.contains("open")) {
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
