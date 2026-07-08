/**
 * Lab 7 - Contrôleur d'application (pas un ViewController) portant le routage.
 *
 * Double sens, sans boucle :
 *   - URL → sélection : `onEquipementRoute` sélectionne le nœud correspondant.
 *   - sélection → URL : `onTreeSelect` met l'URL à jour (redirectTo).
 *
 * Le routage se branche sur la sélection du Deck 6 sans la réécrire :
 * la sélection met à jour le dashboard (MainController.onNodeSelect) ET l'URL.
 *
 * Note (vs énoncé) : la condition de route s'écrit avec un GROUPE CAPTURANT
 * `([0-9]+)` — sans les parenthèses, ExtJS ne transmet pas la valeur `:id` à
 * l'action. La sélection est de plus différée si l'arbre n'est pas encore chargé
 * (cas du deep-link au démarrage).
 */
Ext.define('VIGIE.controller.Navigation', {
    extend: 'Ext.app.Controller',

    requires: [
        'VIGIE.util.Session',
        'VIGIE.view.admin.Login',
        'VIGIE.view.admin.Admin'
    ],

    routes: {
        'equipement/:id': {
            action: 'onEquipementRoute',
            conditions: { ':id': '([0-9]+)' }
        },
        // Route PROTÉGÉE : `before` s'exécute avant l'action et tranche —
        // action.resume() laisse passer, action.stop() bloque. C'est
        // l'intercepteur d'authentification, y compris pour un deep-link
        // #admin tapé à froid dans la barre d'adresse.
        'admin': {
            action: 'onAdminRoute',
            before: 'onBeforeAdmin'
        }
    },

    control: {
        'app-main treepanel': { select: 'onTreeSelect' }
    },

    // Garde d'authentification : sans session, la vue réservée n'est JAMAIS
    // créée ; on affiche le login, et un login réussi rejoue la même route —
    // `force: true` car le hash vaut déjà « admin » et n'a pas changé.
    onBeforeAdmin: function (action) {
        if (VIGIE.util.Session.estConnecte()) {
            action.resume();
            return;
        }

        action.stop();
        Ext.create('VIGIE.view.admin.Login', {
            listeners: {
                connecte: function () { this.redirectTo('admin', { force: true }); },
                scope: this
            }
        }).show();
    },

    onAdminRoute: function () {
        Ext.create('VIGIE.view.admin.Admin', {
            listeners: {
                // Token refusé par le serveur : la session locale a été jetée
                // (AdminController) — rejouer la route ramène au login.
                sessionexpiree: function () { this.redirectTo('admin', { force: true }); },
                scope: this
            }
        }).show();
    },

    // URL → sélection (différée si l'arbre n'est pas encore chargé)
    onEquipementRoute: function (id) {
        var tree = Ext.first('app-main treepanel');
        if (!tree) { return; }

        // Deep-link à froid : le store de l'arbre est BINDÉ ({arbo}) et le
        // binding est asynchrone — au moment de la route, tree.getStore()
        // renvoie encore un TreeStore par défaut, dont le `load` ne viendra
        // jamais. On résout donc le store via le ViewModel, qui l'instancie
        // immédiatement ; son `load` (async) déclenchera la sélection.
        var store = tree.lookupViewModel().getStore('arbo'),
            select = function () {
                var node = store.getRoot().findChild('equipementId', parseInt(id, 10), true);
                if (node) { tree.getSelectionModel().select(node); }
            };

        if (store.getRoot() && store.getRoot().hasChildNodes()) {
            select();
        } else {
            store.on('load', select, null, { single: true });
        }
    },

    // sélection → URL
    onTreeSelect: function (tree, node) {
        if (node.get('type') === 'equipement') {
            this.redirectTo('equipement/' + node.get('equipementId'));
        }
    }
});
