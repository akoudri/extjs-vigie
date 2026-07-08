/**
 * Lab 8 - Extension E2 : initialisation d'Ext.ux.ajax.SimManager.
 *
 * Les classes ux (Simlet, DataSimlet, JsonSimlet, SimXhr, SimManager) ne sont
 * pas distribuées dans les packages npm @sencha ; le runner (voir test/README.md)
 * les charge depuis les ressources de test d'ext-core, servies par webpack sous
 * /node_modules/@sencha/ext-core/test/resources/ux/ajax/.
 *
 * Ces sources datent d'avant ExtJS 6 : deux adaptations sont nécessaires.
 */
(function () {
    // Adaptation 1 - le hook historique de SimManager.init vise
    // Ext.data.Connection#openRequest, méthode disparue : depuis ExtJS 6,
    // l'XHR est créé par Ext.data.request.Ajax#openRequest. On pose le hook
    // au bon endroit ; celui (inopérant) posé par init() reste sans effet.
    Ext.define('VIGIE.test.SimHook', {
        override: 'Ext.data.request.Ajax',

        openRequest: function (options, requestOptions, async) {
            var mgr = Ext.ux.ajax.SimManager,
                xhr = mgr.ready && !options.nosim &&
                      mgr.getXhr(requestOptions.method, requestOptions.url, options, async);

            return xhr || this.callParent(arguments);
        }
    });

    // Adaptation 2 - sans paramètre `sort` ni `group` (store sans remoteSort),
    // DataSimlet.getData finit sur Ext.decode(undefined), qui lève.
    Ext.define('VIGIE.test.DataSimletSansTri', {
        override: 'Ext.ux.ajax.DataSimlet',

        getData: function (ctx) {
            if (!ctx.params.sort && !ctx.params.group) {
                return this.data;
            }
            return this.callParent(arguments);
        }
    });

    // `defaultSimlet: null` : les URL non enregistrées continuent en Ajax
    // réel - indispensable quand les specs tournent DANS l'application
    // vivante (arborescence, alarmes et mesures restent servies par le mock).
    Ext.ux.ajax.SimManager.init({ delay: 30, defaultSimlet: null });
})();
