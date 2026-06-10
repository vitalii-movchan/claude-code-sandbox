# Data-driven обвязка лендинга

Это **технический образец механики**, а не образец дизайна. Здесь показано
только то, что одинаково для всех лендингов: как связать пустой контейнер в
HTML → массив в `data.js` → рендер в `main.js`, как экранировать строки и как
сделать мобильное меню.

**Структуру, секции, кнопки, классы, палитру и вёрстку бери с референса** —
здесь нет «правильного» набора секций или имён классов. Имена `id`-контейнеров,
порядок `<script>` и функция `escapeHtml()` — единственное, что нужно сохранить.

## Паттерн «контейнер → массив → рендер»

Для каждого списка (услуги, отзывы, команда, тарифы, статьи — что угодно с
референса):

1. В `index.html` — пустой контейнер с уникальным `id`:
   ```html
   <div id="services-list"></div>
   ```
2. В `js/data.js` — массив под этим ключом в `window.SITE_DATA`. Структура
   объектов произвольна — какие поля нужны секции с референса, такие и делай.
3. В `js/main.js` — блок, который берёт контейнер по `id`, мапит массив в
   разметку (классы/теги — под дизайн референса) и кладёт в `innerHTML`.
   Каждое строковое поле — через `escapeHtml()`.

## js/data.js — единственный источник контента

```js
/* Контент лендинга. Правь массивы здесь — разметка списков строится отсюда.
   Ключи и поля — произвольные, под секции конкретного референса. */
window.SITE_DATA = {
  // пример; реальные ключи/поля — те, что нужны секциям с референса
  services: [
    { title: "Название", text: "Описание." },
  ],
  reviews: [
    { author: "Имя", text: "Текст отзыва." },
  ],
};
```

## js/main.js — рендер + мобильное меню

`escapeHtml()` и порядок загрузки (этот файл — после `data.js`, оба `defer`)
обязательны. Разметку внутри `.map(...)` — теги и классы — пиши под дизайн
референса; ниже это лишь иллюстрация механики.

```js
/* Рендер data-driven секций + мобильное меню. Грузится с defer, после data.js. */
(function () {
  "use strict";

  const data = window.SITE_DATA || {};

  /* По одному такому блоку на каждый список с референса.
     Разметка/классы внутри map — под дизайн конкретного лендинга. */
  const servicesEl = document.getElementById("services-list");
  if (servicesEl && data.services) {
    servicesEl.innerHTML = data.services
      .map((s) => `
        <article class="service">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.text)}</p>
        </article>`)
      .join("");
  }

  const reviewsEl = document.getElementById("reviews-list");
  if (reviewsEl && data.reviews) {
    reviewsEl.innerHTML = data.reviews
      .map((r) => `
        <article class="review">
          <p>${escapeHtml(r.text)}</p>
          <p class="review-author">${escapeHtml(r.author)}</p>
        </article>`)
      .join("");
  }

  /* Мобильное меню — если в дизайне референса есть бургер-навигация.
     Селекторы/классы подгони под свою разметку. */
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

  /* Экранирование строк перед вставкой через innerHTML — всегда. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
```

## index.html — обязательные технические детали

Сам каркас секций — по референсу. Из технического обязательно лишь:

```html
<!-- ... верстка секций по дизайну референса ... -->

<!-- Контейнеры списков — пустые, наполняет main.js -->
<div id="services-list"></div>
<div id="reviews-list"></div>

<!-- В самом конце <body>: data.js строго перед main.js, оба defer -->
<script src="js/data.js" defer></script>
<script src="js/main.js" defer></script>
```

## css/styles.css — только про токены

Единственное техническое пожелание к стилям — **вынести палитру с референса в
CSS-переменные `:root`** (как минимум акцентный цвет), чтобы цвет правился в
одном месте:

```css
:root {
  /* значения — С РЕФЕРЕНСА, это лишь пример набора токенов */
  --color-accent: #1573e6;
  --color-text: #2b2f36;
  --color-bg: #ffffff;
}
```

Всё остальное в CSS — сетки, типографика, секции, кнопки, адаптив — делай под
вид конкретного референса. Никакого обязательного набора классов или единой
точки перелома нет.
