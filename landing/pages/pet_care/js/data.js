/* Pawsome Pet Care — контент лендинга.
   Правь массивы здесь — разметка списков строится из этих данных в main.js. */
window.SITE_DATA = {
  /* Пути к реальным фото. Положи файлы в pet_care/img/ — main.js подставит их
     как фон; пока файла нет, показывается оформленная заглушка с emoji. */
  media: {
    hero: "img/hero-dog.jpg",
    vets: "img/vet.jpg",
    footer: "img/footer-dog.jpg"
  },

  services: [
    {
      id: "training",
      title: "Training",
      description: "Professional obedience and behavior training for your dog.",
      emoji: "🐕"
    },
    {
      id: "sitting",
      title: "Sitting",
      description: "Safe and loving pet sitting while you're away.",
      emoji: "🐾"
    },
    {
      id: "grooming",
      title: "Grooming",
      description: "Full-service grooming: bath, trim, nails and more.",
      emoji: "✂️"
    },
    {
      id: "walking",
      title: "Walking",
      description: "Daily walks and exercise to keep your pet happy and healthy.",
      emoji: "🦮"
    },
    {
      id: "daycare",
      title: "Day Care",
      description: "Fun, supervised daytime care for your furry friend.",
      emoji: "🏠"
    }
  ],

  reviews: [
    {
      name: "Benjamin Stevens",
      text: "The most fantastic service on the website is absolutely wonderful and so friendly with great results for my dog.",
      stars: 4,
      avatar: "B"
    },
    {
      name: "Natalie Foster",
      text: "The pawsome website is a valuable resource for pet owners. It offers a wealth of information on various aspects of pet care.",
      stars: 5,
      avatar: "N",
      featured: true
    },
    {
      name: "Christopher",
      text: "The website is quite amazing looking, easy to navigate and has the interest of your pet.",
      stars: 4,
      avatar: "C"
    }
  ],

  footerLinks: [
    {
      column: "left",
      links: [
        { label: "Contact Us", href: "#" },
        { label: "About Us", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "FAQs", href: "#" },
        { label: "How it work", href: "#" }
      ]
    },
    {
      column: "right",
      links: [
        { label: "Day Care", href: "#" },
        { label: "Privacy & Policy", href: "#" },
        { label: "Popular Product", href: "#" },
        { label: "Call Us", href: "#" },
        { label: "Blog", href: "#" }
      ]
    }
  ]
};
