var YOUTUBE_COMMAND = {
    CODE: "YOUTUBE_COMMAND",
    TO_IFRAME: {
        LOAD: "LOAD",
        UNLOAD: "UNLOAD",
        PLAY: "PLAY",
        PAUSE: "PAUSE",
        SET_CURRENT_TIME: "SET_CURRENT_TIME",
        SET_PLAYBACK_RATE: "SET_PLAYBACK_RATE"
    },
    FROM_IFRAME: {
        ERROR: "ERROR",
        IFRAME_READY: "IFRAME_READY",
        IS_LIVE: "IS_LIVE",
        QUALITY_CHANGE: "QUALITY_CHANGE",
        UPDATE_TIME: "UPDATE_TIME",
        UPDATE_STATE: "UPDATE_STATE"
    }
};

var YOUTUBE_STATE = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3
};
