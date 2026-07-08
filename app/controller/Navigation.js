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

    routes: {
        'equipement/:id': {
            action: 'onEquipementRoute',
            conditions: { ':id': '([0-9]+)' }
        }
    },

    control: {
        'app-main treepanel': { select: 'onTreeSelect' }
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
