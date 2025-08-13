let containerElement = document.getElementById("container"); // Container element
let playerElement = void 0; // Player element node
let player = void 0; // Player instance

let src = "";
let startTime = 0;

let isApiReady = false;
window.onYouTubeIframeAPIReady = function() {
    isApiReady = true;
    if (isApiReady && isApiLoading) {
        loadPlayer(src, startTime);
    }
};

let isApiLoading = false;

const postCommand = (command, data) => {
    window.parent.postMessage({
        type: YOUTUBE_COMMAND.CODE,
        command: command,
        data: data
    }, "*");
}

const handleMessage = (event) => {
    const data = event.data;
    if (data.type !== YOUTUBE_COMMAND.CODE) return;
    switch (data.command) {
        case YOUTUBE_COMMAND.TO_IFRAME.LOAD:
            isApiLoading = true;
            try {
                // Reset
                src = data.src || "";
                startTime = data.startTime || 0;
            } catch (err) {}
            if (isApiReady && isApiLoading) {
                loadPlayer(src, startTime);
            }
            break;
        case YOUTUBE_COMMAND.TO_IFRAME.UNLOAD:
            isApiLoading = false;
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
                player.seekTo(data.timeS);
            } catch (err) {}
            break;
        case YOUTUBE_COMMAND.TO_IFRAME.SET_PLAYBACK_RATE:
            try {
                player.setPlaybackRate(data.value);
            } catch (err) {}
            break;
    }
}

window.addEventListener("message", handleMessage);

const getConfigure = (src, startTime) => {
    return {
        width: containerElement.offsetWidth,
        height: containerElement.offsetHeight,
        videoId: src,
        // videoId: "rhuOfaAyhPs",
        playerVars: {
            autoplay: 1, // Auto playback
            controls: 0, // Hide youtube control bar
            enablejsapi: 0, // Disable youtube key controls
            hl: LANGUAGE,
            iv_load_policy: 3, // Cause video annotations to not be shown by default
            rel: 0, // Minimum display related movie
            start: startTime || void 0 // Start time
        }
    }
}

let timeoutUpdateTime = void 0;
const UPDATE_TIME_INTERVAL = 500; // 500ms
const startUpdateTime = () => {
    stopUpdateTime();
    updateTime();
}
const updateTime = () => {
    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const data = {
            currentTime: currentTime,
            duration: duration
        }
        postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_TIME, data);
    } catch (err) {}
    clearTimeout(timeoutUpdateTime);
    timeoutUpdateTime = setTimeout(() => {
        updateTime();
    }, UPDATE_TIME_INTERVAL);
}
const stopUpdateTime = () => {
    clearTimeout(timeoutUpdateTime);
    timeoutUpdateTime = void 0;
}

const loadPlayer = ({ src, startTime }) => {
    try {
        if (!src) {
            eventError({ data: 2213 });
        }
    } catch (err) {}
    try {
        unloadPlayer(); // Ensure clean init
    } catch (err) {}
    try {
        // Create player element
        try {
            const playerElement = document.createElement("div");
            playerElement.className = "player";
            if (this._.containerElement) {
                this._.containerElement.appendChild(playerElement);
                this._.playerElement = playerElement;
            }
        } catch (err) {}
        // Create new player
        const configure = getConfigure(src, startTime);
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
}

const unloadPlayer = () => {
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
}

const addEventListener = () => {
    try {
        this._.player.addEventListener("onReady", this._.eventReady);
        this._.player.addEventListener("onStateChange", this._.eventStateChange);
        this._.player.addEventListener("onPlaybackQualityChange", this._.eventQualityChange);
        this._.player.addEventListener("onError", this._.eventError);
    } catch (err) {}
};
const removeEventListener = () => {
    try {
        this._.player.removeEventListener("onReady", this._.eventReady);
        this._.player.removeEventListener("onStateChange", this._.eventStateChange);
        this._.player.removeEventListener("onPlaybackQualityChange", this._.eventQualityChange);
        this._.player.removeEventListener("onError", this._.eventError);
    } catch (err) {}
};

// Events
const eventReady = (e) => {
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
const eventStateChange = (e) => {
    try {
        switch (e.data) {
            case YOUTUBE_STATE.UNSTARTED: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.UNSTARTED }); break;
            case YOUTUBE_STATE.ENDED: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.ENDED }); break;
            case YOUTUBE_STATE.PLAYING: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.PLAYING }); break;
            case YOUTUBE_STATE.PAUSED: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.PAUSED }); break;
            case YOUTUBE_STATE.BUFFERING: postCommand(YOUTUBE_COMMAND.FROM_IFRAME.UPDATE_STATE, { state: YOUTUBE_STATE.BUFFERING }); break;
        }
    } catch (err) {}
};
const eventQualityChange = (e) => {
    try {
        postCommand(YOUTUBE_COMMAND.FROM_IFRAME.QUALITY_CHANGE, { data: e.data });
    } catch (err) {}
};
const eventError = (e) => {
    try {
        postCommand(YOUTUBE_COMMAND.FROM_IFRAME.ERROR, { error: e.data });
    } catch (err) {}
};

window.addEventListener("unload", () => {
    window.removeEventListener("message", handleMessage);
});