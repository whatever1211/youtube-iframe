var containerElement = document.getElementById("container"); // Container element
var playerElement = void 0; // Player element node
var player = void 0; // Player instance
var isPaused = false;

var src = "";
var startTime = 0;

var isApiReady = false;
window.onYouTubeIframeAPIReady = function() {
    isApiReady = true;
    if (isApiReady && isSrcLoading) {
        loadPlayer(src, startTime);
    }
};

var isSrcLoading = false;

function postCommand(command, data) {
    try {
        window.parent.postMessage({
            type: YOUTUBE_COMMAND.CODE,
            command: command,
            data: data
        }, "*");
    } catch (err) {}
};

function handleMessage(event) {
    try {
        var data = event.data;
        if (data.type !== YOUTUBE_COMMAND.CODE) return;
        // postLog(data);
        var payload = data.data;
        switch (data.command) {
            case YOUTUBE_COMMAND.TO_IFRAME.LOAD:
                isSrcLoading = true;
                try {
                    // Reset
                    src = payload.src || "";
                    startTime = payload.startTime || 0;
                    lang = payload.lang || void 0;
                } catch (err) {}
                    if (isApiReady && isSrcLoading) {
                    loadPlayer(src, startTime, lang);
                }
                break;
            case YOUTUBE_COMMAND.TO_IFRAME.UNLOAD:
                isSrcLoading = false;
                unloadPlayer();
                break;
            case YOUTUBE_COMMAND.TO_IFRAME.PLAY:
                try {
                    player.playVideo();
                } catch (err) {}
                break;
            case YOUTUBE_COMMAND.TO_IFRAME.PAUSE:
                try {
                    player.pauseVideo();
                } catch (err) {}
                break;
            case YOUTUBE_COMMAND.TO_IFRAME.SET_CURRENT_TIME:
                try {
                    player.seekTo(payload.timeS);
                } catch (err) {}
                break;
            case YOUTUBE_COMMAND.TO_IFRAME.SET_PLAYBACK_RATE:
                try {
                    player.setPlaybackRate(payload.value);
                } catch (err) {}
                break;
        }
    } catch (err) {}
};

window.addEventListener("message", handleMessage);

function getConfigure(src, startTime, lang) {
    try {
        return {
            width: containerElement.offsetWidth,
            height: containerElement.offsetHeight,
            videoId: src,
            // videoId: "rhuOfaAyhPs",
            playerVars: {
                autoplay: 1, // Auto playback
                controls: 0, // Hide youtube control bar
                enablejsapi: 0, // Disable youtube key controls
                hl: lang,
                iv_load_policy: 3, // Cause video annotations to not be shown by default
                rel: 0, // Minimum display related movie
                start: startTime || void 0 // Start time
            }
        };
    } catch (err) {}
    return void 0;
};

var timeoutUpdateTime = void 0;
var UPDATE_TIME_INTERVAL = 500; // 500ms
function startUpdateTime() {
    stopUpdateTime();
    updateTime();
};
var updateTime = function updateTime() {
    try {
        if (!isPaused) {
            var currentTime = player.getCurrentTime();
            var duration = player.getDuration();
            var data = {
                currentTime: currentTime,
                duration: duration
            };
            postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_TIME, data);
        }
    } catch (err) {}
    clearTimeout(timeoutUpdateTime);
    timeoutUpdateTime = setTimeout(function() {
        updateTime();
    }, UPDATE_TIME_INTERVAL);
};
function stopUpdateTime() {
    clearTimeout(timeoutUpdateTime);
    timeoutUpdateTime = void 0;
};

function loadPlayer(src, startTime, lang) {
    try {
        if (!src) {
            eventError({ data: 2213 });
            return;
        }
    } catch (err) {}
    try {
        unloadPlayer(); // Ensure clean init
    } catch (err) {}
    try {
        // Reset variable
        isPaused = false;

        // Create player element
        try {
            var newElement = document.createElement("div");
            newElement.className = "player";
            if (containerElement) {
                containerElement.appendChild(newElement);
                playerElement = newElement;
            }
        } catch (err) {}

        // Create new player
        var configure = getConfigure(src, startTime, lang);
        try {
            player = new YT.Player(playerElement, configure);
        } catch (err) {
            try {
                if (err.message === "Invalid video id") {
                    eventError({ data: 2 });
                }
            } catch (err) {}
        }
        try {
            addEventListener();
        } catch (err) {}
    } catch (err) {}
};

function unloadPlayer() {
    try {
        removeEventListener();
    } catch (err) {}
    try {
        stopUpdateTime();
    } catch (err) {}
    try {
        if (player) {
            try {
                player.destroy();
            } catch (err) {}
            player = void 0;
        }
    } catch (err) {}
    try {
        if (playerElement) {
            try {
                containerElement.removeChild(playerElement);
            } catch (err) {}
            playerElement = void 0;
        }
    } catch (err) {}
};

function addEventListener() {
    try {
        player.addEventListener("onReady", eventReady);
        player.addEventListener("onStateChange", eventStateChange);
        player.addEventListener("onPlaybackQualityChange", eventQualityChange);
        player.addEventListener("onError", eventError);
    } catch (err) {}
};
function removeEventListener() {
    try {
        player.removeEventListener("onReady", eventReady);
        player.removeEventListener("onStateChange", eventStateChange);
        player.removeEventListener("onPlaybackQualityChange", eventQualityChange);
        player.removeEventListener("onError", eventError);
    } catch (err) {}
};

// Events
function eventReady(e) {
    try {
        if (player.getDuration() === 0) {
            // When ready and player have not loaded data. The metadata duration of live is 0.
            postCommand(YOUTUBE_COMMAND.FROM_IFRAME.IS_LIVE, { isLive: true });
        }
    } catch (err) {}
    try {
        startUpdateTime();
    } catch (err) {}
};
function eventStateChange(e) {
    try {
        switch (e.data) {
            case YOUTUBE_STATE.UNSTARTED: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.UNSTARTED }); break;
            case YOUTUBE_STATE.ENDED: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.ENDED }); break;
            case YOUTUBE_STATE.PLAYING: isPaused = false; postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.PLAYING }); break;
            case YOUTUBE_STATE.PAUSED: isPaused = true; postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.PAUSED }); break;
            case YOUTUBE_STATE.BUFFERING: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.BUFFERING }); break;
        }
    } catch (err) {}
};
function eventQualityChange(e) {
    try {
        postCommand(YOUTUBE_COMMAND.FROM_IFRAME.QUALITY_CHANGE, { data: e.data });
    } catch (err) {}
};
var eventError = function eventError(e) {
    try {
        postCommand(YOUTUBE_COMMAND.FROM_IFRAME.ERROR, { error: e.data });
    } catch (err) {}
};

window.addEventListener("unload", function() {
    window.removeEventListener("message", handleMessage);
});

postCommand(YOUTUBE_COMMAND.FROM_IFRAME.IFRAME_READY, {});
