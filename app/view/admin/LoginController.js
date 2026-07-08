/**
 * ViewController de la fenêtre de connexion (route protégée #admin).
 */
Ext.define('VIGIE.view.admin.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.admin-login',

    requires: ['VIGIE.util.Session'],

    onConnecter: function () {
        var valeurs = this.lookup('formulaire').getValues();

        VIGIE.util.Session.connecter(valeurs.login, valeurs.password,
            function () {
                // Succès : signaler puis disparaître — la suite (rejouer la
                // route #admin) appartient au contrôleur Navigation.
                var fenetre = this.getView();
                fenetre.fireEvent('connecte', fenetre);
                fenetre.close();
            },
            function () {
                // 401 : le serveur a refusé — on l'affiche, sans fermer.
                this.lookup('msgErreur').show();
            },
            this);
    },

    onToucheEntree: function (champ, e) {
        if (e.getKey() === e.ENTER && this.lookup('formulaire').isValid()) {
            this.onConnecter();
        }
    }
});
