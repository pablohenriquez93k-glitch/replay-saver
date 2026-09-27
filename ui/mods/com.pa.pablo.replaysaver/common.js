/* Replay Saver: shared helpers (setting definition + es/en strings). */
var replaySaver = (function () {
    var SETTING_KEY = 'replay_saver_auto_save';

    var STRINGS = {
        'Auto-save Replay at Match End': 'Guardar replay al terminar la partida',
        'Watch Replay': 'Ver replay',
        'AUTO-REPLAY': 'AUTO-REPLAY'
    };

    var locale = function () {
        var lang;
        try { lang = api.settings.value('ui', 'language'); } catch (e) {}
        if (!lang) {
            try { lang = decode(localStorage['locale']); } catch (e) {}
        }
        return String(lang || 'en');
    };

    /* key is the English text; uses the game's loc() for other languages */
    var text = function (key) {
        if (locale().indexOf('es') === 0 && STRINGS[key])
            return STRINGS[key];
        return loc('!LOC:' + key);
    };

    var definition = {
        title: text('Auto-save Replay at Match End'),
        type: 'select',
        options: ['ON', 'OFF'],
        optionsText: ['!LOC:ON', '!LOC:OFF'],
        default: 'ON'
    };

    var registerSetting = function () {
        var ui = api.settings.definitions && api.settings.definitions.ui;
        if (ui && ui.settings && !ui.settings[SETTING_KEY])
            ui.settings[SETTING_KEY] = definition;
    };

    var autoSaveEnabled = function () {
        var value;
        try { value = api.settings.value('ui', SETTING_KEY); } catch (e) {}
        return value !== 'OFF';
    };

    registerSetting();

    return {
        SETTING_KEY: SETTING_KEY,
        text: text,
        autoSaveEnabled: autoSaveEnabled
    };
})();
