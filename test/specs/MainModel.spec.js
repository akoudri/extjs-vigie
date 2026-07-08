/**
 * Lab 8 - Test unitaire de la formula `enDefaut` du ViewModel.
 *
 * Test de logique : on instancie directement la classe (pas d'UI). `notify()`
 * force l'évaluation synchrone des bindings/formulas.
 */
describe('VIGIE MainModel', function () {
    it('enDefaut est vrai pour un équipement en DEFAUT', function () {
        var vm = new VIGIE.view.main.MainModel();
        vm.set('equipementCourant',
            new VIGIE.model.Equipement({ nom: 'V-3', etat: 'DEFAUT' }));
        vm.notify();
        expect(vm.get('enDefaut')).toBe(true);
    });

    it('enDefaut est faux pour un équipement OK', function () {
        var vm = new VIGIE.view.main.MainModel();
        vm.set('equipementCourant',
            new VIGIE.model.Equipement({ nom: 'P-12', etat: 'OK' }));
        vm.notify();
        expect(vm.get('enDefaut')).toBe(false);
    });
});
