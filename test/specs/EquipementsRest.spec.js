/**
 * Lab 8 - Extension E2 : chargement du store à travers son VRAI proxy `rest`.
 *
 * Contrairement au proxy `memory` (Equipements.spec.js) qui court-circuite la
 * couche réseau, Ext.ux.ajax.SimManager intercepte l'XHR au ras du transport :
 * construction d'URL, reader (tableau nu json-server, typage des champs) et
 * configuration du proxy `rest` du Model sont réellement exercés - sans serveur.
 *
 * Le jeu simulé diffère volontairement de mock/db.json (enregistrement 99
 * inexistant côté json-server) : si l'assertion passe, c'est la preuve que la
 * réponse vient bien du simlet et non du serveur mock resté actif.
 */
describe('VIGIE.store.Equipements via proxy rest simulé (E2)', function () {
    var URL = 'http://localhost:3000/equipements',
        DATA = [
            { id: 1,  nom: 'P-12',  etat: 'OK',      zoneId: 1, dateInstall: '2020-01-15' },
            { id: 2,  nom: 'V-3',   etat: 'DEFAUT',  zoneId: 1, dateInstall: '2019-09-01' },
            { id: 99, nom: 'X-SIM', etat: 'MAINTENANCE', zoneId: 2, dateInstall: '2024-01-01' }
        ];

    beforeAll(function () {
        var simlet = {};
        simlet[URL] = { stype: 'json', data: DATA };
        Ext.ux.ajax.SimManager.register(simlet);
    });

    afterAll(function () {
        // Rend l'URL à l'Ajax réel (defaultSimlet: null => passe-plat).
        delete Ext.ux.ajax.SimManager.simlets[URL];
    });

    it('charge les enregistrements à travers le proxy rest réel', function (done) {
        var store = Ext.create('VIGIE.store.Equipements', { autoLoad: false });

        // C'est bien le proxy du Model qui est exercé, pas un substitut.
        expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

        store.load({
            callback: function (records, operation, success) {
                expect(success).toBe(true);

                // L'enregistrement 99 n'existe que dans le simlet : la
                // réponse ne peut pas venir du json-server.
                expect(store.getCount()).toBe(3);
                expect(store.getById(99).get('nom')).toBe('X-SIM');

                // Le reader a fait son travail : état lu, date typée,
                // champ calculé évalué.
                expect(store.getById(2).get('etat')).toBe('DEFAUT');
                expect(Ext.isDate(store.getById(2).get('dateInstall'))).toBe(true);
                expect(store.getById(2).get('enDefaut')).toBe(true);

                store.destroy();
                done();
            }
        });
    });
});
