/**
 * Vue réservée de la route protégée #admin : statistiques de supervision.
 *
 * La protection est DOUBLE, et c'est le cœur de l'exemple :
 *   - côté client, la route #admin ne crée cette fenêtre qu'avec une session
 *     ouverte (garde `before` dans VIGIE.controller.Navigation) ;
 *   - côté serveur, GET /statistiques exige le token (mock/auth.js) — le
 *     store ci-dessous reçoit 401 si le client « triche », et la fenêtre
 *     émet alors `sessionexpiree` pour ramener l'utilisateur au login.
 */
Ext.define('VIGIE.view.admin.Admin', {
    extend: 'Ext.window.Window',
    xtype: 'admin-stats',

    requires: [
        'VIGIE.view.admin.AdminController',
        'Ext.grid.Panel',
        'Ext.data.proxy.Ajax'
    ],

    controller: 'admin-stats',

    modal: true,
    width: 440,
    height: 320,
    layout: 'fit',

    listeners: { boxready: 'onBoxReady' },

    initComponent: function () {
        var L = VIGIE.Libelles,
            colonnes = this.items[0].columns;

        this.title = L.STATISTIQUES;
        this.buttons[0].text = L.DECONNEXION;
        colonnes[0].text = L.INDICATEUR;
        colonnes[1].text = L.VALEUR;

        this.callParent();
    },

    items: [{
        xtype: 'grid',
        reference: 'grille',
        store: {
            fields: ['indicateur', 'valeur', 'unite'],
            // Pas d'autoLoad : le contrôleur charge lui-même pour pouvoir
            // intercepter un éventuel 401 (session invalidée côté serveur).
            proxy: { type: 'ajax', url: 'http://localhost:3000/statistiques' }
        },
        columns: [
            { dataIndex: 'indicateur', flex: 1 },
            {
                dataIndex: 'valeur',
                width: 110,
                align: 'right',
                renderer: function (v, meta, rec) {
                    var unite = rec.get('unite');
                    return unite ? v + ' ' + unite : v;
                }
            }
        ]
    }],

    buttons: [{ handler: 'onDeconnecter' }]
});
