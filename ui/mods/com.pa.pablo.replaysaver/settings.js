/* Replay Saver: show the auto-save toggle in Settings > Gameplay. */
(function () {
    /* common.js already added the definition; rebuild the item map to include it */
    model.settingDefinitions.notifySubscribers();

    $('.option-list.ui .form-group').append(
        '<div class="sub-group">'
        + '<div class="option" data-bind="template: { name: \'setting-template\', '
        + 'data: $root.settingsItemMap()[\'ui.' + replaySaver.SETTING_KEY + '\'] }"></div>'
        + '</div>');
})();
