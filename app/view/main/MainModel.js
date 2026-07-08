/**
 * ViewModel de la vue principale - Lab 6.
 *
 * `arbo` instancie l'arborescence UNE seule fois pour la partager entre l'arbre
 * (treepanel) et le fil d'Ariane (breadcrumb) — condition de leur synchronisation.
 */
Ext.define('VIGIE.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        equipementCourant: null
    },

    stores: {
        equipements: { type: 'equipements' },
        arbo: { type: 'arborescence' }
    },

    formulas: {
        // Conservée (extension D3 / requise par les tests du Lab 8).
        enDefaut: function (get) {
            var e = get('equipementCourant');
            return !!e && e.get('etat') === 'DEFAUT';
        }
    }
});
