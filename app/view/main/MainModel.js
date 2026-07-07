/**
 * ViewModel de la vue principale - Lab 3.
 *
 * Porte l'état applicatif (`equipementCourant`) et des *formulas* d'affichage.
 *
 * Pourquoi des formulas ? `equipementCourant` est ici une classe à config system
 * (Lab M1) : un binding direct `{equipementCourant.nom}` ne traverse pas le getter
 * de config → rendu vide. Les formulas appellent explicitement getNom()/getEtat().
 * Au Lab 4, Equipement devient un Ext.data.Model et le binding direct remplacera
 * ces formulas.
 */
Ext.define('VIGIE.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        equipementCourant: null,

        // Extension E2 : source unique d'un binding bidirectionnel (champ éditable + écho).
        seuil: 80,

        // Extension E3 : valeur haute fréquence (télémétrie simulée), alimentée
        // par le ViewController. Initialisée à 0 pour que la formula ne casse pas
        // avant le premier tick.
        mesure: 0
    },

    formulas: {
        nomCourant:  function (get) { var e = get('equipementCourant'); return e ? e.getNom()  : '—'; },
        etatCourant: function (get) { var e = get('equipementCourant'); return e ? e.getEtat() : '—'; },

        // Extension E1 : visibilité conditionnelle d'un bandeau d'alerte.
        enDefaut: function (get) {
            var e = get('equipementCourant');
            return !!e && e.getEtat() === 'DEFAUT';
        },

        // Extension E3 : formula dépendant d'une valeur haute fréquence.
        // `console.count` matérialise le churn : elle est recalculée à CHAQUE
        // changement de `mesure` (≈ 5×/s ici). Lecture seule, aucun effet de bord
        // sur l'état (sinon : risque de boucle de recalcul).
        mesureFormatee: function (get) {
            console.count('[E3] recalcul mesureFormatee');
            return get('mesure').toFixed(1) + ' °C';
        }
    }
});
