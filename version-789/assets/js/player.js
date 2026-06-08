import { H as Hls } from './hls-dru42stk.js';

export function initMoviePlayer(source, options) {
    var video = document.querySelector(options.videoSelector);
    var cover = document.querySelector(options.coverSelector);
    var prepared = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function play() {
        prepare();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var request = video.play();

        if (request && typeof request.catch === 'function') {
            request.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        prepare();
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
