(function () {
  var MIN_HEIGHT = 4;
  var MAX_HEIGHT = 14;
  var RANDOM_FLOOR = 0.2;
  var ANIMATE_DUR = 0.5;
  var RESET_DUR = 0.6;
  var WAVEFORM_INTERVAL = 150;

  var toggle = document.getElementById('musicToggle');
  var bars = document.querySelectorAll('.bar');
  var video = document.querySelector('.hero-video video');
  var label = document.getElementById('sound-label');
  if (!toggle || !bars.length || !video) return;

  var wrapper = document.querySelector('.music--switch-wrapper') || toggle.closest('.music-toggle-wrapper') || toggle.parentElement;
  if (wrapper) wrapper.style.cursor = 'pointer';

  var isPlaying = false;
  var waveformTimer = null;
  if (label) label.textContent = 'Sound Off';

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
    if (label) label.textContent = isPlaying ? 'Sound On' : 'Sound Off';
  });
})();
