document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const PLACEHOLDER_DIM = { start: 0, end: 15.7, range: 17.2, hold: 38.8, fadeRange: 6.9 };
  const OVERLAY_FADE = { start: 2.8, end: 17.4, range: 14.6, hold: 38.8, fadeRange: 6.9 };
  const TEXT_FADE = { start: 11.4, end: 21.7, range: 10.3, hold: 38.8, fadeRange: 6.9 };
  const WORD_TRIGGER = 11.4;

  const scene = document.querySelector('._3d-scene');
  const overlay = document.querySelector('.concept-overlay');
  const heading = document.querySelector('.heading-medium.concept');
  const placeholder = document.querySelector('._3d-placeholder');
  if (!scene || !overlay || !heading) return;

  const split = new SplitText(heading, { type: 'words', wordsClass: 'concept-word' });
  const words = split.words;
  gsap.set(overlay, { display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0 });
  gsap.set(heading, { opacity: 0 });
  gsap.set(words, { opacity: 0, y: 20 });

  let wordsRevealed = false;
  let wordsTween = null;

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const placeholderOpacity = (p) => {
    var s = PLACEHOLDER_DIM;
    if (p < s.start) return 1;
    if (p <= s.end) return 1 - ((p - s.start) / s.range) * 0.5;
    if (p < s.hold) return 0.5;
    if (p >= s.hold) return 0.5 + ((p - s.hold) / s.fadeRange) * 0.5;
    return 1;
  };

  const overlayOpacity = (p) => {
    var s = OVERLAY_FADE;
    if (p < s.start) return 0;
    if (p < s.end) return easeOut((p - s.start) / s.range);
    if (p < s.hold) return 1;
    if (p >= s.hold) return 1 - easeInOut((p - s.hold) / s.fadeRange);
    return 0;
  };

  const textOpacity = (p) => {
    var s = TEXT_FADE;
    if (p < s.start) return 0;
    if (p < s.end) return (p - s.start) / s.range;
    if (p < s.hold) return 1;
    if (p >= s.hold) return 1 - (p - s.hold) / s.fadeRange;
    return 0;
  };

  ScrollTrigger.create({
    trigger: scene,
    start: 'top center',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const pct = 100 * self.progress;
      const textAlpha = textOpacity(pct);
      if (placeholder) gsap.set(placeholder, { opacity: placeholderOpacity(pct) });
      gsap.to(overlay, { opacity: overlayOpacity(pct), duration: 0.3, ease: 'power2.out', overwrite: true });
      gsap.set(heading, { opacity: textAlpha });
      if (pct >= WORD_TRIGGER && !wordsRevealed) {
        wordsRevealed = true;
        if (wordsTween) wordsTween.kill();
        wordsTween = gsap.to(words, { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' });
      }
      if (pct < WORD_TRIGGER && wordsRevealed) {
        wordsRevealed = false;
        if (wordsTween) wordsTween.kill();
        gsap.set(words, { opacity: 0, y: 20 });
      }
    },
  });

  window.refreshConceptText = () => {
    split.revert();
    const newSplit = new SplitText(heading, { type: 'words', wordsClass: 'concept-word' });
    gsap.set(newSplit.words, { opacity: 0, y: 20 });
    ScrollTrigger.refresh();
  };

  const revealTargets = document.querySelectorAll(
    '.reveal-section .concept-kanji-wrapper, .reveal-section .concept-img, .reveal-section .concept-wrapper.flex-space'
  );
  gsap.set(revealTargets, { visibility: 'hidden' });
  let maskTriggered = false;

  gsap.to('.reveal-section', {
    clipPath: 'inset(0% 0 0 0)',
    ease: 'none',
    scrollTrigger: {
      trigger: '.reveal-wrapper',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        if (!maskTriggered && self.progress >= 0.5) {
          maskTriggered = true;
          revealTargets.forEach((el) => {
            gsap.set(el, { visibility: 'visible' });
            el.setAttribute('data-reveal', 'mask');
          });
          initMaskReveal();
        }
      },
    },
  });

  ScrollTrigger.create({
    trigger: '.reveal-wrapper',
    start: 'top top',
    end: 'bottom bottom',
    onLeave: () => gsap.set('.reveal-section', { position: 'absolute', bottom: 0, top: 'auto' }),
    onEnterBack: () => gsap.set('.reveal-section', { position: 'fixed', top: 0, bottom: 'auto', left: 0, width: '100%' }),
  });
});
