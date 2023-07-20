module.exports = Object.freeze({
    STAGE: "DEBUG", // RELEASE, DEBUG, DEVELOPMENT
    LOG: {
        LEVEL: {
            fatal: 0,
            error: 1,
            info: 2,
            success: 3
        },
        FILES: {
            fatal: "./logs/fatals.log",
            error: "./logs/error.log",
            info: "./logs/info.log"
        }
    },
    CLIENT: {
        ERROR_MSG: "Meow, i think you missed how to use the command properly!!! o_O",
    }
});