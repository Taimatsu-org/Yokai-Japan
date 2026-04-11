window.YokaiShimmer = (() => {
  const LIGHT_SHIMMER = 'rgba(245,239,225,0.8)';
  const DARK_SHIMMER = 'rgba(31,29,33,0.8)';
  const ARROW_LIGHT = 'rgb(180,175,165)';
  const ARROW_DARK = 'rgb(70,68,72)';
  const MASK_GRADIENT = 'linear-gradient(90deg,transparent 0%,transparent 10%,black 50%,transparent 90%,transparent 100%)';

  const isLight = (c) => {
    const m = c.match(/\d+/g);
    if (!m) return false;
    return (parseInt(m[0]) * 299 + parseInt(m[1]) * 587 + parseInt(m[2]) * 114) / 1000 > 150;
  };

  const shimmerFor = (base) => isLight(base) ? DARK_SHIMMER : LIGHT_SHIMMER;

  const setup = (el, overrideColor) => {
    const base = overrideColor || getComputedStyle(el).color;
    const shimmer = shimmerFor(base);
    el._baseColor = base;
    el._shimmerColor = shimmer;
    el.style.position = 'relative';
    el.style.color = base;
    let overlay = el.querySelector('.shimmer-overlay');
    if (!overlay) {
      overlay = document.createElement('span');
      overlay.className = 'shimmer-overlay';
      overlay.textContent = el.textContent;
      overlay.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;color:' + shimmer + ';pointer-events:none;white-space:nowrap;mask-image:' + MASK_GRADIENT + ';-webkit-mask-image:' + MASK_GRADIENT + ';mask-size:150% 100%;-webkit-mask-size:150% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;';
      el.appendChild(overlay);
    }
    overlay.style.maskPosition = '250% 0';
    overlay.style.webkitMaskPosition = '250% 0';
  };

  const setupArrow = (el) => {
    if (el._arrowBaseColor) return;
    el._arrowBaseColor = getComputedStyle(el).color;
    el._arrowShimmerColor = isLight(el._arrowBaseColor) ? ARROW_DARK : ARROW_LIGHT;
  };

  const transition = (el, tc) => {
    el.style.color = tc;
    const overlay = el.querySelector('.shimmer-overlay');
    if (overlay) {
      const shimmer = shimmerFor(tc);
      overlay.style.color = shimmer;
      el._baseColor = tc;
      el._shimmerColor = shimmer;
    }
  };

  const play = (el, dur = 5) => {
    const overlay = el.querySelector('.shimmer-overlay');
    if (!overlay) return gsap.timeline();
    return gsap.timeline()
      .fromTo(overlay, { maskPosition: '250% 0', webkitMaskPosition: '250% 0' }, { maskPosition: '50% 0', webkitMaskPosition: '50% 0', duration: 0.2, ease: 'power2.in' })
      .to(overlay, { maskPosition: '0% 0', webkitMaskPosition: '0% 0', duration: 0.2, ease: 'none' })
      .to(overlay, { maskPosition: '-150% 0', webkitMaskPosition: '-150% 0', duration: dur, ease: 'power4.out' });
  };

  const playArrow = (el, dur = 3.5) => {
    setupArrow(el);
    gsap.killTweensOf(el);
    el.style.color = el._arrowBaseColor;
    return gsap.timeline()
      .to(el, { color: el._arrowShimmerColor, duration: 0.3, ease: 'power2.out' })
      .to(el, { color: el._arrowBaseColor, duration: dur, ease: 'power4.out' });
  };

  return { setup, setupArrow, play, playArrow, transition, isLight };
})();
