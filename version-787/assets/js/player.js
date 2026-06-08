function initMoviePlayer(elementId, sourceUrl) {
  var root = document.getElementById(elementId);

  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var button = root.querySelector('.player-cover');
  var started = false;

  if (!video || !button) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function play() {
    attachSource();
    button.classList.add('hidden');

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
