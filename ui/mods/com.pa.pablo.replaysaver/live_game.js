/* Replay Saver: auto-save a replay when a single-player match ends and
   overwrite it with the full history when the player leaves the match. */
(function () {
    var SETTLE_DELAY = 2500; /* ms: let the server reach game_over after defeat */
    var EXIT_DELAY = 1500; /* ms: give the server time to write before disconnecting */
    var replayName = null; /* set on the first save; reused so the exit save overwrites it */
    var pending = false;
    var exiting = false;

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
       in FFA) we ask for 'replay' too so it opens as a replay. */
    var write = function () {
        console.log('[Replay Saver] write_replay: ' + replayName);
        model.send_message('write_replay', { name: replayName, type: 'replay' });
    };

    var firstSave = function () {
        pending = false;
        if (replayName || !eligible())
            return;

        /* same filter as the save popup: ':' in the time would break the Windows filename */
        replayName = ('AI Skirmish ' + UberUtility.createDateTimeString() + ' ' + replaySaver.text('AUTO-REPLAY'))
            .replace(/[^a-zA-Z0-9_-]+/g, ' ');

        /* playing_shared pauses the sim while saving, so resume it if it was running */
        var stillPlaying = !model.gameOver();
        var wasPaused = model.paused();

        write();

        if (stillPlaying && !wasPaused)
            _.delay(function () {
                if (!model.gameOver() && model.paused())
                    model.playSim();
            }, 3000);
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

    /* run the original exit after overwriting the replay (once) */
    var beforeExit = function (original) {
        return function () {
            var self = this;
            var args = arguments;
            if (!replayName || exiting || !eligible())
                return original.apply(self, args);

            exiting = true;
            write();
            _.delay(function () { original.apply(self, args); }, EXIT_DELAY);
        };
    };

    handlers['game_over.nav'] = beforeExit(handlers['game_over.nav']);
    model.navToMainMenu = beforeExit(model.navToMainMenu);
    model.exitGame = beforeExit(model.exitGame);
})();
