define(['pubsub',
    'site/pubSubTable'], function(PubSub, pubSubTable) {

    'use strict';

    var THEME_STORAGE_KEY = 'rcap.theme.current';

    var ThemeManager = function() {

        this.initialise = function() {

            var me = this;

            // subscribe to theme change:
            PubSub.subscribe(pubSubTable.updateDomTheme, function(msg, themeUri) {
                me.applyAssetTheme(themeUri);
            });

            PubSub.subscribe(pubSubTable.updateSiteThemePackage, function(msg, siteThemePackage) {
                me.applyPackageTheme(siteThemePackage);
            });

            PubSub.subscribe(pubSubTable.initSite, function(msg, site) {
                // extract settings:
                var settings = site.settings.extract();

                me.applyPackageTheme(settings.siteThemePackage);

                // apply saved custom properties theme:
                me.applySavedTheme();
            });

            PubSub.subscribe(pubSubTable.themeChanged, function(msg, themeId) {
                me.applyCustomPropertiesTheme(themeId);
            });

        };

        this.cleanUp = function() {
            $('head > link.rcap').remove();
        };

        this.applyLink = function(themeUri, stylesheetClass) {

            // first remove the link, if any:
            $('head > link.' + stylesheetClass).remove();

            // validate stylesheetClass:
            if(['package', 'asset'].indexOf(stylesheetClass) < 0 || !themeUri){
                return;
            }

            var linkToInsert = $('<link />')
                    .attr({
                        'class': stylesheetClass,
                        'type': 'text/css',
                        'rel': 'stylesheet',
                        'href': themeUri
                    });

            // valid order is package, asset:
            var selectorPrefix = 'head > link.';

            if(stylesheetClass === 'asset') {
                var packageLink = $(selectorPrefix + 'package');

                if(packageLink.length) {
                    linkToInsert.insertAfter(packageLink);
                } else {
                    $('head').append(linkToInsert);
                }
            } else if(stylesheetClass === 'package') {
                var assetLink = $(selectorPrefix + 'asset');

                if(assetLink.length) {
                    linkToInsert.insertBefore(assetLink);
                } else {
                    $('head').append(linkToInsert);
                }
            }
        };

        this.applyAssetTheme = function(themeUri) {
            this.applyLink(themeUri, 'asset');
        };

        this.applyPackageTheme = function(siteThemePackage) {
            if(siteThemePackage) {
                this.applyLink('/shared.R/' + siteThemePackage + '/rcap-style.css', 'package');
            } else {
                this.applyLink(undefined, 'package');
            }
        };

        this.applyCustomPropertiesTheme = function(themeId) {
            if (!themeId || themeId === 'default') {
                document.documentElement.removeAttribute('data-rcap-theme');
            } else {
                document.documentElement.setAttribute('data-rcap-theme', themeId);
            }
        };

        this.applySavedTheme = function() {
            var savedTheme;
            try {
                savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
            } catch (e) {
                savedTheme = 'default';
            }
            this.applyCustomPropertiesTheme(savedTheme);
        };

        this.switchTheme = function(themeId) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, themeId);
            } catch (e) {
                // localStorage unavailable
            }
            this.applyCustomPropertiesTheme(themeId);
            PubSub.publish(pubSubTable.themeChanged, themeId);
        };

    };

    return ThemeManager;
});
