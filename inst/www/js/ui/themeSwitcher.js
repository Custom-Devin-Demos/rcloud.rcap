define(['pubsub',
    'site/pubSubTable'], function(PubSub, pubSubTable) {

    'use strict';

    var STORAGE_KEY = 'rcap.theme.current';

    var themes = [
        { id: 'default', label: 'Default (Light)' },
        { id: 'dark', label: 'Dark' },
        { id: 'high-contrast', label: 'High Contrast' }
    ];

    var ThemeSwitcher = function() {

        this.initialise = function() {

            var me = this;

            PubSub.subscribe(pubSubTable.showThemeSwitcherDialog, function() {
                me.showDialog();
            });

            // apply saved theme on init:
            var savedTheme = me.getSavedTheme();
            if (savedTheme && savedTheme !== 'default') {
                me.applyTheme(savedTheme);
            }
        };

        this.getSavedTheme = function() {
            try {
                return localStorage.getItem(STORAGE_KEY) || 'default';
            } catch (e) {
                return 'default';
            }
        };

        this.saveTheme = function(themeId) {
            try {
                localStorage.setItem(STORAGE_KEY, themeId);
            } catch (e) {
                // localStorage unavailable
            }
        };

        this.applyTheme = function(themeId) {
            if (themeId === 'default') {
                document.documentElement.removeAttribute('data-rcap-theme');
            } else {
                document.documentElement.setAttribute('data-rcap-theme', themeId);
            }
            this.saveTheme(themeId);
            PubSub.publish(pubSubTable.themeChanged, themeId);
        };

        this.showDialog = function() {
            var me = this;
            var currentTheme = me.getSavedTheme();

            // build dialog markup:
            var html = '<div class="header"><h3>Theme Switcher</h3></div>';
            html += '<div class="body" style="padding:20px">';
            html += '<div class="form-group"><label>Select Theme</label>';
            html += '<select id="rcap-theme-select" class="form-control" style="margin-top:8px">';

            themes.forEach(function(theme) {
                var selected = theme.id === currentTheme ? ' selected' : '';
                html += '<option value="' + theme.id + '"' + selected + '>' + theme.label + '</option>';
            });

            html += '</select></div>';
            html += '<p class="description" style="margin-top:10px">Theme preference is saved in your browser and persists across sessions.</p>';
            html += '</div>';
            html += '<div class="jqm-footer">';
            html += '<a href="#" class="approve" id="rcap-theme-apply">Apply</a>';
            html += '<a href="#" class="cancel">Cancel</a>';
            html += '</div>';

            // check if dialog already exists:
            var dialogEl = $('#dialog-themeSwitcher');
            if (!dialogEl.length) {
                dialogEl = $('<div id="dialog-themeSwitcher" class="jqmWindow" style="display:none;width:400px"></div>');
                $('#rcap-designer, #rcap-viewer, body').first().append(dialogEl);
                dialogEl.jqm({ modal: true });
            }

            dialogEl.html(html);
            dialogEl.jqmShow();

            // preview on change:
            $('#rcap-theme-select').on('change', function() {
                me.applyTheme($(this).val());
            });

            // apply button:
            dialogEl.find('.approve').on('click', function() {
                var selectedTheme = $('#rcap-theme-select').val();
                me.applyTheme(selectedTheme);
                dialogEl.jqmHide();
                return false;
            });

            // cancel button:
            dialogEl.find('.cancel').on('click', function() {
                // revert to saved:
                me.applyTheme(currentTheme);
                dialogEl.jqmHide();
                return false;
            });
        };
    };

    return ThemeSwitcher;
});
