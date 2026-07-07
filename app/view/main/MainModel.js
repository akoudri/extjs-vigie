/**
 * ViewModel de la vue principale - Lab 4.
 *
 * `equipementCourant` est désormais un `Ext.data.Model` (sélection de grille) :
 * le binding direct `{equipementCourant.nom}` se résout via les fields - les
 * formulas de contournement nomCourant/etatCourant du Lab 3 disparaissent.
 */
Ext.define('VIGIE.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        equipementCourant: null,

        // E1 : nombre d'alarmes de l'équipement courant. Alimenté par le
        // ViewController après chargement du store d'association eq.alarmes()
        // (chargement asynchrone → on passe par une clé du ViewModel).
        nbAlarmes: 0
    },

    stores: {
        equipements: { type: 'equipements' },

        // E2 : chained store branché sur le store source global `alarmes`.
        alarmesActives: { type: 'alarmesactives' }
    },

    formulas: {
        // Conservée (extension M3 / requise par les tests du Lab D8).
        // equipementCourant est un Model → on lit le field via get('etat').
        enDefaut: function (get) {
            var e = get('equipementCourant');
            return !!e && e.get('etat') === 'DEFAUT';
        }
    }
});
