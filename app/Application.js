/**
 * Application VIGIE — point d'entrée.
 *
 * `mainView` rend le shell applicatif (VIGIE.view.main.Main) en plein écran.
 */
Ext.define('VIGIE.Application', {
    extend: 'Ext.app.Application',
    name: 'VIGIE',

    // Lab 7 : la locale doit être résolue (et le singleton de libellés
    // éventuellement substitué en EN) avant l'instanciation des vues.
    requires: ['VIGIE.Locale'],

    mainView: 'VIGIE.view.main.Main',

    // E1 (Lab 6) : charger les deux Models au démarrage câble l'association
    // Equipement → alarmes() de façon déterministe (sans require croisé).
    models: ['Equipement', 'Alarme'],

    // E2 (Lab 6) : instancie le store source `alarmes` (storeId global) au
    // démarrage, pour que le Journal et le ChainedStore AlarmesActives
    // puissent le résoudre par son nom.
    stores: ['Alarmes'],

    controllers: ['Navigation'],

    launch: function () {
        // Retirer l'écran de chargement injecté par index.html
        var splash = document.getElementById('splash');
        if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        Ext.getBody().removeCls('launching');
    }
});
