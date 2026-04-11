document.addEventListener('DOMContentLoaded', () => {
  const DURATION = 3.5;
  const STAGGER = 0.15;

  const getTextElements = (root) =>
    Array.from(root.querySelectorAll('*')).filter(
      (el) =>
        el.childNodes.length &&
        Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim()) &&
        !el.closest('.nav-link')
    );

  const bindShimmer = (trigger, elements, arrow) => {
    elements.forEach((el) => window.YokaiShimmer.setup(el));
    if (arrow) window.YokaiShimmer.setupArrow(arrow);
    trigger.addEventListener('mouseenter', () => {
      const tl = gsap.timeline();
      elements.forEach((el, i) => tl.add(window.YokaiShimmer.play(el, DURATION), i * STAGGER));
      if (arrow) tl.add(window.YokaiShimmer.playArrow(arrow, DURATION), elements.length * STAGGER + STAGGER);
    });
  };

  document.querySelectorAll('[data-shimmer]').forEach((el) => {
    var val = el.dataset.shimmer;
    if (val === 'group' || /^\d/.test(val) || el.closest('.nav-link')) return;
    var texts = getTextElements(el);
    if (texts.length) bindShimmer(el, texts, el.querySelector('.caret-right'));
  });

  document.querySelectorAll('[data-shimmer="group"]').forEach((group) => {
    if (group.closest('.nav-link')) return;
    var ordered = Array.from(group.querySelectorAll('[data-shimmer]'))
      .filter((el) => el.dataset.shimmer !== 'group' && !el.closest('.nav-link'))
      .sort((a, b) => a.dataset.shimmer - b.dataset.shimmer);
    if (ordered.length) bindShimmer(group, ordered, group.querySelector('.caret-right'));
  });
});
