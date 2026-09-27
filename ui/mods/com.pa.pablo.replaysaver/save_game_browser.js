/* Replay Saver: "Watch Replay" button on Load Game (forces mode=loadreplay). */
(function () {
    model.replaySaverCanWatch = ko.computed(function () {
        var game = model.selectedGame();
        return model.hasSelectedGame() && !!(game && game.path);
    });

    model.replaySaverWatch = function () {
        if (!model.replaySaverCanWatch())
            return;

        var game = _.clone(model.selectedGame());
        game.localReplay = true; /* in-memory copy only; the file is untouched */

        var go = function () {
            model.lastSceneUrl('coui://ui/main/game/save_game_browser/save_game_browser.html');
            SaveGameUtility.loadGame(game);
        };

        if (model.selectedGameRequiresModeSwitch())
            api.content.setActive(game.content || '').then(go);
        else
            go();
    };

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
