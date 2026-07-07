/**
 * Application VIGIE - point d'entrée.
 *
 * `mainView` rend le shell applicatif (VIGIE.view.main.Main) en plein écran.
 */
Ext.define('VIGIE.Application', {
    extend: 'Ext.app.Application',
    name: 'VIGIE',

    mainView: 'VIGIE.view.main.Main',

    // E1 : charger les deux Models au démarrage câble l'association
    // Equipement → alarmes() de façon déterministe (sans require croisé).
    models: ['Equipement', 'Alarme'],

    // E2 : instancie le store source `alarmes` (storeId global) au démarrage,
    // pour que le ChainedStore AlarmesActives puisse le résoudre par son nom.
    stores: ['Alarmes'],

    launch: function () {
        // Retirer l'écran de chargement injecté par index.html
        var splash = document.getElementById('splash');
        if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        Ext.getBody().removeCls('launching');
    }
});
