function initMaskReveal() {
  document.querySelectorAll('[data-reveal="mask"]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 100%',
      once: true,
      onEnter: () => el.classList.add('is-active'),
    });
  });
}

document.addEventListener('DOMContentLoaded', initMaskReveal);
