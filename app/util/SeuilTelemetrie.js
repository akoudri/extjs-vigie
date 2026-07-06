/**
 * lab 1 - Exercice du *config system* (apply / update).
 *
 * `applySeuil` borne la valeur AVANT stockage (transforme et renvoie).
 * `updateSeuil` réagit APRÈS le changement (effet de bord : journalisation).
 */
Ext.define('VIGIE.util.SeuilTelemetrie', {
    config: {
        seuil: 80
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    },

    applySeuil: function (v) {
        return Math.max(0, Math.min(100, v));   // borne [0, 100]
    },

    updateSeuil: function (v, old) {
        console.log('seuil', old, '->', v);
    }
});
