/**
 * Application VIGIE - point d'entrée.
 *
 * Au fil des labs, `mainView` pointera vers le shell applicatif (VIGIE.view.main.Main).
 * Le bloc d'auto-test de `launch` exerce les classes du lab 1 et journalise les
 * résultats en console (sert de vérification « ça compile et ça tourne »).
 */
Ext.define('VIGIE.Application', {
    extend: 'Ext.app.Application',
    name: 'VIGIE',

    requires: [
        'VIGIE.domain.Equipement',
    ],

    mainView: 'VIGIE.view.main.Main',

    launch: function () {
        // Retirer l'écran de chargement injecté par index.html
        var splash = document.getElementById('splash');
        if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        Ext.getBody().removeCls('launching');
    },
});
