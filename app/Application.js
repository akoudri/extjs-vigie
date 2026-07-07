/**
 * Application VIGIE - point d'entrée.
 *
 * `mainView` rend le shell applicatif (VIGIE.view.main.Main) en plein écran.
 */
Ext.define('VIGIE.Application', {
    extend: 'Ext.app.Application',
    name: 'VIGIE',

    mainView: 'VIGIE.view.main.Main',

    launch: function () {
        // Retirer l'écran de chargement injecté par index.html
        var splash = document.getElementById('splash');
        if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        Ext.getBody().removeCls('launching');
    }
});
