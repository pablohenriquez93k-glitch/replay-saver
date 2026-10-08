/* Replay Saver: auto-save a replay when a single-player match ends (or when the
   player quits it) and overwrite it with the full history when the player leaves. */
(function () {
    var SETTLE_DELAY = 2500; /* ms: let the server reach game_over after defeat */
    var SAVE_TIMEOUT = 15000; /* ms: go on anyway if the server never reports the save finished */
    var POLL_INTERVAL = 250; /* ms: how often to check the replay file after game over */
    var FIRST_FILE_WAIT = 4000; /* ms: how long the exit save waits for the first save's file */
    var replayName = null; /* set on the first save; reused so the exit save overwrites it */
    var pending = false;
    var exiting = false;
    var firstWritten = false; /* the first save was sent: its file will show up */
    var waiter = null; /* current wait for a save to finish; a new wait cancels the old one */

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

    /* call onDone once the server reports the save finished (saving true -> false),
       or after SAVE_TIMEOUT. Only one wait at a time: the exit save queues behind the first one. */
    var waitForSave = function (onDone, timeout) {
        if (waiter)
            clearTimeout(waiter.timer);
        var self = { sawSaving: false };
        self.finish = function (timedOut) {
            if (waiter !== self)
                return;
            clearTimeout(self.timer);
            waiter = null;
            if (timedOut === true)
                console.warn('[Replay Saver] no confirmation that the save finished: ' + replayName);
            var next = self.next;
            try {
                onDone();
            } finally {
                if (next)
                    next();
            }
        };
        self.setTimeout = function (ms) {
            clearTimeout(self.timer);
            self.end = Date.now() + Math.max(ms, 0);
            self.timer = setTimeout(function () { self.finish(true); }, Math.max(ms, 0));
        };
        self.setTimeout(timeout === undefined ? SAVE_TIMEOUT : timeout);
        waiter = self;
    };

    model.saving.subscribe(function (value) {
        if (!waiter)
            return;
        if (value)
            waiter.sawSaving = true;
        else if (waiter.sawSaving)
            waiter.finish();
    });

    /* after game over the server no longer reports saving: watch the file instead.
       Finish the wait once the replay's metadata timestamp is newer than before the write. */
    var writeAndWatchFile = function () {
        var self = waiter;
        var metaTime = function () {
            return api.file.loadReplayMetadata(replayName).then(function (data) {
                return data && data.save ? data.save.utc_timestamp : null;
            });
        };
        var poll = function (before) {
            if (waiter !== self)
                return;
            metaTime().then(function (now) {
                if (now && now > before)
                    self.finish();
                else
                    setTimeout(function () { poll(before); }, POLL_INTERVAL);
            }, function () {
                if (!self.warned) {
                    self.warned = true;
                    console.log('[Replay Saver] replay file not found yet: ' + replayName);
                }
                setTimeout(function () { poll(before); }, POLL_INTERVAL);
            });
        };
        var firstWaitEnd = Date.now() + FIRST_FILE_WAIT;
        var start = function () {
            if (waiter !== self)
                return;
            var go = function (before) {
                if (!before && firstWritten && Date.now() < firstWaitEnd) {
                    /* the first save is still being written: wait for its file, or this
                       wait would end on it instead of on the exit save. If it never shows
                       up (the first save failed), write anyway after FIRST_FILE_WAIT. */
                    setTimeout(start, POLL_INTERVAL);
                    return;
                }
                /* utc_timestamp has 1 s resolution: if the last write was this same second,
                   wait for the next one so the new timestamp is strictly newer */
                var wait = before ? Math.min((before + 1) * 1000 - Date.now(), 1100) : 0;
                setTimeout(function () {
                    if (waiter !== self)
                        return;
                    write();
                    poll(before || 0);
                }, wait > 0 ? wait + 50 : 0);
            };
            metaTime().then(go, function () { go(null); });
        };
        start();
    };

    /* playing_shared pauses the sim while saving and never resumes it */
    var resumeSim = function () {
        if (!model.gameOver() && model.paused())
            model.playSim();
    };

    var firstSave = function () {
        pending = false;
        if (replayName || !eligible())
            return;

        replayName = newName();

        if (!model.gameOver() && !model.paused())
            waitForSave(resumeSim);

        firstWritten = true;
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
            var deadline = Date.now() + SAVE_TIMEOUT; /* the whole exit never waits longer */

            var done = false;
            var leave = function () {
                if (done)
                    return;
                done = true;
                original.apply(self, args);
            };

            /* wait for the save, resume the sim so the "Save complete / Resume"
               popup doesn't show (quit while playing), then leave */
            var exitSave = function () {
                waitForSave(function () {
                    try {
                        resumeSim();
                    } finally {
                        _.delay(leave, 300);
                    }
                }, deadline - Date.now());

                if (model.gameOver())
                    writeAndWatchFile();
                else
                    write();
            };

            /* the first save is still running: its saving true -> false could end this
               wait early, so write the exit save after it finishes */
            if (waiter) {
                waiter.next = exitSave;
                /* leave at least half of the exit time for the exit save */
                waiter.setTimeout(Math.min(waiter.end - Date.now(), SAVE_TIMEOUT / 2));
            }
            else
                exitSave();
        };
    };

    handlers['game_over.nav'] = beforeExit(handlers['game_over.nav']);
    model.navToMainMenu = beforeExit(model.navToMainMenu);
    model.exitGame = beforeExit(model.exitGame);
})();
