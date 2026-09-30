/* Replay Saver: "Watch Replay" button on Load Game (forces mode=loadreplay). */
(function () {
    var pendingWatch = null; /* clone of the save waiting for the mode-switch confirmation */

    model.replaySaverCanWatch = ko.computed(function () {
        var game = model.selectedGame();
        return model.hasSelectedGame() && !!(game && game.path);
    });

    var load = function (game) {
        model.lastSceneUrl('coui://ui/main/game/save_game_browser/save_game_browser.html');
        SaveGameUtility.loadGame(game);
    };

    model.replaySaverWatch = function () {
        if (!model.replaySaverCanWatch())
            return;

        var game = _.clone(model.selectedGame());
        game.localReplay = true; /* in-memory copy only; the file is untouched */

        if (model.selectedGameRequiresModeSwitch()) {
            /* ask first, like Resume Game does */
            pendingWatch = game;
            $('#confirmSwitchModes').modal('show');
        }
        else
            load(game);
    };

    /* the stock OK button calls this: load the pending replay instead of the selected save */
    var stockSwitch = model.switchModesAndloadGame;
    model.switchModesAndloadGame = function () {
        var watch = pendingWatch;
        pendingWatch = null; /* read before setActive so a later Resume Game is not affected */

        if (!watch)
            return stockSwitch.apply(this, arguments);

        api.content.setActive(watch.content || '').then(function () { load(watch); });
    };


    /* auto-saves are replays: Resume Game can't continue them, so block and dim it (Watch Replay opens them) */
    model.replaySaverIsAuto = ko.computed(function () {
        var game = model.selectedGame();
        return !!(game && game.name && game.name.indexOf(replaySaver.text('AUTO-REPLAY')) !== -1);
    });

    var stockLoad = model.loadGame;
    model.loadGame = function () {
        if (model.replaySaverIsAuto())
            return;
        return stockLoad.apply(this, arguments);
    };

    var dimResume = function () {
        _.defer(function () { /* after the stock css binding has run */
            /* set both states: the stock binding doesn't re-run when the selection stays loadable */
            var enabled = model.hasSelectedGame() && !model.replaySaverIsAuto();
            $('#game-bar #join').toggleClass('btn_std', enabled).toggleClass('btn_std_disabled', !enabled);
        });
    };
    model.replaySaverIsAuto.subscribe(dimResume);
    model.hasSelectedGame.subscribe(dimResume);

    $('#confirmSwitchModes').on('hidden.bs.modal', function () { pendingWatch = null; });

    $('head').append('<style>'
        + '#game-bar { display: flex; justify-content: flex-end; }'
        + '#replay-saver-watch { min-width: 220px; margin-right: 8px; }'
        + '</style>');

    $('#game-bar #join').before(
        '<div id="replay-saver-watch" data-bind="click: $root.replaySaverWatch, '
        + 'css: { btn_std: $root.replaySaverCanWatch(), btn_std_disabled: !$root.replaySaverCanWatch() }, '
        + 'click_sound: \'default\', rollover_sound: \'default\'">'
        + '<div class="btn_label"></div></div>');
    $('#replay-saver-watch .btn_label').text(replaySaver.text('Watch Replay'));
})();
