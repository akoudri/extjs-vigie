/**
 * Lab 8 - Test unitaire du store, proxy `memory` mocké.
 *
 * Un proxy `memory` (données en dur, lecture synchrone) isole le test du réseau
 * et exerce le chargement du store sans serveur.
 */
describe('VIGIE.store.Equipements', function () {
    it('charge des enregistrements depuis le proxy', function () {
        var store = Ext.create('VIGIE.store.Equipements', {
            autoLoad: false,
            proxy: { type: 'memory', data: [
                { id: 1, nom: 'P-12', etat: 'OK' },
                { id: 2, nom: 'V-3',  etat: 'DEFAUT' }
            ]}
        });
        store.load();
        expect(store.getCount()).toBe(2);
        expect(store.getById(2).get('etat')).toBe('DEFAUT');
    });
});
