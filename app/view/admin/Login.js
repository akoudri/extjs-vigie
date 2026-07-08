/**
 * Fenêtre de connexion (route protégée #admin).
 *
 * Ne décide de rien : après un login accepté par le serveur, elle émet
 * `connecte` et se ferme. C'est le contrôleur Navigation qui rejoue alors la
 * route #admin — la fenêtre reste ainsi réutilisable hors routage.
 *
 * Démo : admin / vigie (voir mock/auth.js).
 */
Ext.define('VIGIE.view.admin.Login', {
    extend: 'Ext.window.Window',
    xtype: 'admin-login',

    requires: [
        'VIGIE.view.admin.LoginController',
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],

    controller: 'admin-login',

    modal: true,
    width: 320,
    layout: 'fit',
    defaultFocus: 'textfield',

    // Libellés résolus à l'instanciation, comme dans Main.
    initComponent: function () {
        var L = VIGIE.Libelles,
            form = this.items[0];

        this.title = L.CONNEXION;
        form.buttons[0].text = L.CONNEXION;

        Ext.Array.each(form.items, function (i) {
            switch (i.name || i.reference) {
                case 'login':     i.fieldLabel = L.IDENTIFIANT; break;
                case 'password':  i.fieldLabel = L.MOT_DE_PASSE; break;
                case 'msgErreur': i.html = L.IDENTIFIANTS_INVALIDES; break;
            }
        });

        this.callParent();
    },

    items: [{
        xtype: 'form',
        reference: 'formulaire',
        bodyPadding: 16,
        defaults: {
            xtype: 'textfield',
            anchor: '100%',
            allowBlank: false,
            // Entrée = valider le formulaire (confort de démo)
            listeners: { specialkey: 'onToucheEntree' }
        },
        items: [
            { name: 'login' },
            { name: 'password', inputType: 'password' },
            {
                xtype: 'component',
                reference: 'msgErreur',
                hidden: true,
                style: 'color: #cf4c35;',
                padding: '8 0 0 0'
            }
        ],
        // formBind : actif seulement quand le formulaire est valide. Le
        // bouton doit appartenir au FORM PANEL (pas à la fenêtre) : c'est le
        // form qui surveille sa validité et (dés)active ses boutons liés.
        buttons: [{ formBind: true, disabled: true, handler: 'onConnecter' }]
    }]
});
