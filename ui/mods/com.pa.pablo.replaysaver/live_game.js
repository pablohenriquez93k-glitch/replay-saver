/* Replay Saver: auto-save a replay when a single-player match ends (or when the
   player quits it) and overwrite it with the full history when the player leaves. */
(function () {
    var SETTLE_DELAY = 2500; /* ms: let the server reach game_over after defeat */
    var EXIT_DELAY = 1500; /* ms: give the server time to write before disconnecting */
    var RESUME_FALLBACK = 15000; /* ms: resume anyway if the server never reports saving */
    var replayName = null; /* set on the first save; reused so the exit save overwrites it */
    var pending = false;
    var exiting = false;
    var resumeAfterSave = false;
    var sawSaving = false;
    var afterResume = null; /* exit waiting for the save to finish */

    var isGalacticWar = function () {
        return model.gameType() === 'Galactic War'
            || (model.gameOptions && model.gameOptions.isGalaticWar && model.gameOptions.isGalaticWar());
    };

    var eligible = function () {
        return model.canSave()
            && model.singleHumanPlayer()
            && !model.viewReplay()
            && model.serverMode() !== 'replay'
            && !model.playerWasAlwaysSpectating()
            && !isGalacticWar()
            && replaySaver.autoSaveEnabled();
    };

    /* in game_over the server forces type 'replay'; while still playing (defeated
       in FFA, or quitting) we ask for 'replay' too so it opens as a replay.
       The server ignores the message if another client (e.g. a spectator) is connected. */
    var write = function () {
        console.log('[Replay Saver] write_replay: ' + replayName);
        model.send_message('write_replay', { name: replayName, type: 'replay' });
    };

    var newName = function () {
        /* same filter as the save popup: ':' in the time would break the Windows filename */
        return ('AI Skirmish ' + UberUtility.createDateTimeString() + ' ' + replaySaver.text('AUTO-REPLAY'))
            .replace(/[^a-zA-Z0-9_-]+/g, ' ');
    };

    /* playing_shared pauses the sim while saving and never resumes it:
       resume once the server reports the save is finished (saving true -> false) */
    var resume = function () {
        if (!resumeAfterSave)
            return;
        resumeAfterSave = false;
        sawSaving = false;
        if (!model.gameOver() && model.paused())
            model.playSim();
        if (afterResume)
            afterResume();
    };

    model.saving.subscribe(function (value) {
        if (!resumeAfterSave)
            return;
        if (value)
            sawSaving = true;
        else if (sawSaving)
            resume();
    });

    var firstSave = function () {
        pending = false;
        if (replayName || !eligible())
            return;

        replayName = newName();

        if (!model.gameOver() && !model.paused()) {
            resumeAfterSave = true;
            sawSaving = false;
            _.delay(resume, RESUME_FALLBACK);
        }

        write();
    };

    ko.computed(function () {
        var ended = model.gameOver() || model.defeated();
        if (!ended || replayName || pending)
            return;
        if (!eligible())
            return;
        pending = true;
        _.delay(firstSave, model.gameOver() ? 500 : SETTLE_DELAY);
    });

    /* run the original exit after saving (once). A second click while waiting is ignored. */
    var beforeExit = function (original) {
        return function () {
            var self = this;
            var args = arguments;

            if (exiting)
                return;

            if (!replayName && eligible())
                replayName = newName(); /* quitting a match in progress counts as surrender */
            else if (!replayName || !eligible())
                return original.apply(self, args);

            exiting = true;

            var done = false;
            var leave = function () {
                if (done)
                    return;
                done = true;
                original.apply(self, args);
            };

            if (!model.gameOver() && !model.paused()) {
                /* still playing (quit): wait for the save, resume the sim so the
                   "Save complete / Resume" popup doesn't show, then leave */
                resumeAfterSave = true;
                sawSaving = false;
                afterResume = function () { _.delay(leave, 300); };
                _.delay(leave, RESUME_FALLBACK);
            }
            else
                _.delay(leave, EXIT_DELAY);

            write();
        };
    };

    handlers['game_over.nav'] = beforeExit(handlers['game_over.nav']);
    model.navToMainMenu = beforeExit(model.navToMainMenu);
    model.exitGame = beforeExit(model.exitGame);
})();
