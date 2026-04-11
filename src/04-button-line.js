document.addEventListener('DOMContentLoaded', () => {
  const DURATION = 0.4;
  const EASE = 'power2.out';
  const buttons = [...document.querySelectorAll('.primary--button'), ...document.querySelectorAll('.news-row')];
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    const fill = btn.querySelector('.btn--line-fill');
    const arrow = btn.querySelector('.caret-right');
    if (!fill) return;
    if (arrow) window.YokaiShimmer.setupArrow(arrow);
    let animating = false;
    let hovered = false;

    const slideIn = () => {
      animating = true;
      gsap.fromTo(fill, { x: '-100%' }, {
        x: '0%', duration: DURATION, ease: EASE, onComplete: () => {
          animating = false;
          if (!hovered) slideOut();
        },
      });
    };

    const slideOut = () => {
      animating = true;
      gsap.fromTo(fill, { x: '0%' }, {
        x: '100%', duration: DURATION, ease: EASE, onComplete: () => {
          animating = false;
          gsap.set(fill, { x: '-100%' });
          if (hovered) slideIn();
        },
      });
    };

    btn.addEventListener('mouseenter', () => {
      hovered = true;
      if (!animating) slideIn();
      if (arrow)
        gsap.delayedCall(DURATION, () => {
          if (hovered) {
            gsap.killTweensOf(arrow);
            gsap.to(arrow, { color: arrow._arrowShimmerColor, duration: 0.3, ease: EASE });
          }
        });
    });

    btn.addEventListener('mouseleave', () => {
      hovered = false;
      if (!animating) slideOut();
      if (arrow) {
        gsap.killTweensOf(arrow);
        gsap.to(arrow, { color: arrow._arrowBaseColor, duration: DURATION * 2, ease: 'power4.out' });
      }
    });
  });
});
