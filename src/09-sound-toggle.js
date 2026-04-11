(function () {
  var MIN_HEIGHT = 4;
  var MAX_HEIGHT = 14;
  var RANDOM_FLOOR = 0.2;
  var ANIMATE_DUR = 0.5;
  var RESET_DUR = 0.6;
  var WAVEFORM_INTERVAL = 150;
  var ON_COLOR = 'var(--yokai-white)';

  var toggle = document.getElementById('musicToggle');
  var bars = document.querySelectorAll('.bar');
  var video = document.querySelector('.hero-video video');
  var label = document.getElementById('sound-label');
  if (!toggle || !bars.length || !video) return;

  var wrapper = document.querySelector('.music--switch-wrapper') || toggle.closest('.music-toggle-wrapper') || toggle.parentElement;
  if (wrapper) wrapper.style.cursor = 'pointer';

  var LABEL_ON = label?.dataset.on || 'Sound On';
  var LABEL_OFF = label?.dataset.off || 'Sound Off';

  var isPlaying = false;
  var waveformTimer = null;
  if (label) {
    label.textContent = LABEL_OFF;
    label.style.textAlign = 'right';
  }

  function pinLabelWidth() {
    if (!label) return;
    var current = label.textContent;
    var max = 0;
    [LABEL_OFF, LABEL_ON].forEach(function (text) {
      label.textContent = text;
      max = Math.max(max, label.getBoundingClientRect().width);
    });
    label.textContent = current;
    if (max > 0) label.style.minWidth = Math.ceil(max) + 'px';
  }
  pinLabelWidth();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pinLabelWidth);

  function setRandomHeights() {
    bars.forEach(function (bar) {
      var height = Math.max(MIN_HEIGHT, (Math.random() * (1 - RANDOM_FLOOR) + RANDOM_FLOOR) * MAX_HEIGHT);
      gsap.to(bar, { height: height, duration: ANIMATE_DUR, ease: 'power2.out', overwrite: true });
    });
  }

  function resetHeights() {
    bars.forEach(function (bar) {
      gsap.to(bar, { height: MIN_HEIGHT, duration: RESET_DUR, ease: 'expo.out' });
    });
  }

  (wrapper || toggle).addEventListener('click', function () {
    if (isPlaying) {
      video.muted = true;
      clearInterval(waveformTimer);
      resetHeights();
    } else {
      video.muted = false;
      video.play().catch(function () {});
      waveformTimer = setInterval(setRandomHeights, WAVEFORM_INTERVAL);
    }
    isPlaying = !isPlaying;
    if (label) label.textContent = isPlaying ? LABEL_ON : LABEL_OFF;
    if (label) label.style.color = isPlaying ? ON_COLOR : '';
    bars.forEach(function (bar) {
      bar.style.backgroundColor = isPlaying ? ON_COLOR : '';
      bar.style.fill = isPlaying ? ON_COLOR : '';
    });
  });
})();
