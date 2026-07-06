/**
 * Lab 1 - Première classe métier de VIGIE.
 *
 * Classe ordinaire exploitant le *config system* d'ExtJS : `config` génère
 * automatiquement getters/setters (getNom/setNom, getEtat/setEtat).
 *
 * Note de continuité : au Lab 4, l'équipement migrera vers un véritable
 * `Ext.data.Model` (fields, proxy, store).
 */
Ext.define('VIGIE.domain.Equipement', {
    config: {
        nom:  '',
        etat: 'inconnu'
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    },

    estEnDefaut: function () {
        return this.getEtat() === 'DEFAUT';
    }
});
