/**
 * Session utilisateur de démonstration (route protégée #admin).
 *
 * Détient le token délivré par POST /login et l'ajoute à TOUTES les requêtes
 * Ext.Ajax (événement `beforerequest`) : Ext.Ajax.request comme les proxys de
 * stores en profitent sans rien connaître de la session.
 *
 * Le token est persisté en localStorage : la session survit au rechargement
 * (F5, deep-link #admin à froid). Point pédagogique : ce n'est PAS le client
 * qui décide si elle est encore valable — le serveur répond 401 si le token
 * ne lui convient plus, et l'application repasse alors par le login.
 */
Ext.define('VIGIE.util.Session', {
    singleton: true,

    requires: ['Ext.Ajax'],

    CLE: 'vigie-token',
    URL_LOGIN: 'http://localhost:3000/login',

    token: null,

    constructor: function () {
        this.token = localStorage.getItem(this.CLE) || null;

        Ext.Ajax.on('beforerequest', function (conn, options) {
            if (this.token) {
                options.headers = Ext.apply(options.headers || {}, {
                    Authorization: 'Bearer ' + this.token
                });
            }
        }, this);
    },

    estConnecte: function () {
        return this.token !== null;
    },

    /**
     * Tente l'authentification auprès du mock.
     * @param {String} login
     * @param {String} motDePasse
     * @param {Function} succes appelé après stockage du token
     * @param {Function} echec appelé avec le statut HTTP (401 : identifiants refusés)
     * @param {Object} scope `this` des deux callbacks
     */
    connecter: function (login, motDePasse, succes, echec, scope) {
        Ext.Ajax.request({
            url: this.URL_LOGIN,
            method: 'POST',
            jsonData: { login: login, password: motDePasse },
            success: function (reponse) {
                this.token = Ext.decode(reponse.responseText).token;
                localStorage.setItem(this.CLE, this.token);
                Ext.callback(succes, scope);
            },
            failure: function (reponse) {
                Ext.callback(echec, scope, [reponse.status]);
            },
            scope: this
        });
    },

    deconnecter: function () {
        this.token = null;
        localStorage.removeItem(this.CLE);
    }
});
