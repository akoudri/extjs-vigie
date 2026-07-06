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

    // --- lab 1 (extension E3) : fabrique statique ---
    // `statics` attache la fabrique à la CLASSE (VIGIE.domain.Equipement.depuisCapteur),
    // pas aux instances. Préférable à une fonction libre : elle reste dans le
    // namespace de la classe (découvrable, chargée avec elle) et pourra accéder
    // aux futurs membres statiques/privés sans polluer l'espace global.
    statics: {
        depuisCapteur: function (data) {
            data = data || {};
            return new VIGIE.domain.Equipement({
                nom:  data.id,
                etat: data.statut
            });
        }
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    },

    estEnDefaut: function () {
        return this.getEtat() === 'DEFAUT';
    }
});
