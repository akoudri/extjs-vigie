/**
 * Lab 1 (extension E1) - Classe métier « Alarme ».
 *
 * Démontre la composition : `Alarme` n'hérite PAS de `Horodatable`, elle
 * l'intègre via `mixins`. Toute instance dispose donc de `horodater()` /
 * `derniereMaj()` en plus de ses propres configs (message, severite).
 */
Ext.define('VIGIE.domain.Alarme', {
    mixins: ['VIGIE.mixin.Horodatable'],

    config: {
        message:  '',
        severite: 'info'
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    }
});
