/**
 * ViewController de la vue réservée (route protégée #admin).
 */
Ext.define('VIGIE.view.admin.AdminController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.admin-stats',

    requires: ['VIGIE.util.Session'],

    onBoxReady: function () {
        this.lookup('grille').getStore().load({
            scope: this,
            callback: function (records, operation, succes) {
                if (!succes) {
                    this.onChargementRefuse(operation);
                }
            }
        });
    },

    // Token local présent mais refusé par le serveur (purgé, expiré…) : la
    // session ne vaut plus rien. On la jette et on prévient Navigation via
    // `sessionexpiree`, qui ramène l'utilisateur au login.
    onChargementRefuse: function (operation) {
        var erreur = operation.getError() || {},
            fenetre = this.getView();

        if (erreur.status === 401) {
            VIGIE.util.Session.deconnecter();
            fenetre.fireEvent('sessionexpiree', fenetre);
        }
        fenetre.close();
    },

    onDeconnecter: function () {
        VIGIE.util.Session.deconnecter();
        this.getView().close();
        this.redirectTo('');   // nettoie le hash #admin
    }
});
