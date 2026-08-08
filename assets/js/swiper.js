new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 1,
    grabCursor: true,

// --- ADDED AUTOPLAY TIMER HERE ---
  autoplay: {
    delay: 3000,             // Changes slides every 3000ms (3 seconds)
    disableOnInteraction: false, // Keeps autoplay running after manual swipes/clicks
    pauseOnMouseEnter: true,     // Pauses the timer when user hovers mouse over slider
  },

    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    breakpoints: {
        640: {
            slidesPerView: 2,
            spaceBetween: 24,
        },
        1024: {
            slidesPerView: 4,
            spaceBetween: 24,
        },
    },
});
