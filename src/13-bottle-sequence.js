document.addEventListener('DOMContentLoaded', () => {
  var TOTAL_FRAMES = 121;
  var LAST_FRAME = 120;
  var MOBILE_BREAKPOINT = 768;
  var DESKTOP_DPR_CAP = 1.5;

  var canvas = document.getElementById('yokai-3d-canvas');
  if (!canvas) return;

  var container = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < MOBILE_BREAKPOINT;
  var dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : DESKTOP_DPR_CAP);
  var variant = isMobile ? 'mobile' : 'desktop';
  var baseUrl = import.meta.url.replace(/\/dist\/.*$/, '/sequence/' + variant + '/');

  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.8s ease-out';

  var frames = new Array(TOTAL_FRAMES);
  var currentFrame = -1;

  var drawFrame = (idx, force) => {
    if (idx === currentFrame && !force) return;
    var img = frames[idx];
    if (!img) {
      for (var d = 1; d <= LAST_FRAME; d++) {
        if (idx - d >= 0 && frames[idx - d]) { img = frames[idx - d]; break; }
        if (idx + d < TOTAL_FRAMES && frames[idx + d]) { img = frames[idx + d]; break; }
      }
    }
    if (!img) return;
    currentFrame = idx;
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  };

  var setSize = () => {
    canvas.width = Math.round(container.clientWidth * dpr);
    canvas.height = Math.round(container.clientHeight * dpr);
    var idx = Math.max(0, currentFrame);
    currentFrame = -1;
    drawFrame(idx, true);
  };

  var loadFrame = (idx) => new Promise((resolve) => {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { frames[idx] = img; resolve(true); };
    img.onerror = () => resolve(false);
    img.src = baseUrl + 'frame_' + String(idx).padStart(4, '0') + '.webp';
  });

  var init = async () => {
    var ok = await loadFrame(0);
    if (!ok) throw new Error('Frame 0 failed');

    setSize();
    drawFrame(0, true);
    requestAnimationFrame(() => { canvas.style.opacity = '1'; });

    gsap.registerPlugin(ScrollTrigger);
    var trigger = document.querySelector('._3d-scene') || document.querySelector('[class*="3d-scene"]');
    if (trigger) {
      ScrollTrigger.create({
        trigger: trigger,
        start: 'top center',
        end: 'bottom bottom',
        onUpdate: (self) => {
          drawFrame(Math.round(self.progress * LAST_FRAME));
        }
      });
    }

    var all = [];
    for (var i = 1; i < TOTAL_FRAMES; i++) all.push(loadFrame(i));
    await Promise.all(all);

    window.dispatchEvent(new Event('yokai-sequence-ready'));
  };

  init().catch((err) => {
    console.error('YOKAI SEQ: Load failed', err);
    window.dispatchEvent(new Event('yokai-sequence-ready'));
  });

  new ResizeObserver(setSize).observe(container);
});
