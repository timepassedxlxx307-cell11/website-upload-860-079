import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(player) {
  var source = player.dataset.src;
  var shell = player.closest('.player-shell');
  var button = shell ? shell.querySelector('[data-play-button]') : null;
  var status = shell ? shell.querySelector('[data-player-status]') : null;
  var hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function bindHls() {
    if (!source) {
      setStatus('没有找到可用播放源。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(player);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('视频源加载完成，可点击播放。');
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络错误，正在重新加载视频源。');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体错误，正在尝试恢复播放。');
          hls.recoverMediaError();
          return;
        }

        setStatus('播放器遇到无法恢复的错误。');
        hls.destroy();
      });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', function () {
        setStatus('视频源加载完成，可点击播放。');
      });
    } else {
      setStatus('当前浏览器不支持 HLS 播放。');
    }
  }

  if (button) {
    button.addEventListener('click', function () {
      hideButton();
      player.play().then(function () {
        setStatus('正在播放。');
      }).catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击视频控件播放。');
      });
    });
  }

  player.addEventListener('play', hideButton);
  player.addEventListener('playing', function () {
    setStatus('正在播放。');
  });
  player.addEventListener('pause', function () {
    setStatus('播放已暂停。');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });

  bindHls();
}

document.addEventListener('DOMContentLoaded', function () {
  var players = document.querySelectorAll('.movie-player[data-src]');
  players.forEach(setupPlayer);
});
