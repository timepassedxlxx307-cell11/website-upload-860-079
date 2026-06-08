(function () {
    function setupMoviePlayer(videoId, maskId, streamUrl) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        if (!video || !streamUrl) {
            return;
        }

        var started = false;
        var hls = null;

        function attachStream() {
            if (started) {
                return;
            }
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            attachStream();
            video.controls = true;
            if (mask) {
                mask.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        if (mask) {
            mask.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (!started) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
