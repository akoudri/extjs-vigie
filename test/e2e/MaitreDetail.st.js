/**
 * Lab 8 - Extension E1 : scénario maître-détail de bout en bout (ESQUISSE).
 *
 * Spec au format Sencha Test (futures API `ST.*`, scénario WebDriver) : les
 * futures s'enchaînent de façon asynchrone, chaque étape attendant que la
 * précédente soit observable dans le DOM. Sencha Test étant commercial (non
 * disponible ici, comme le package `exporter` au Lab 5), ce fichier est une
 * esquisse NON exécutée - la version portable, elle, est jouable telle quelle :
 * voir maitre-detail.portable.js (vérifiée, même parcours).
 *
 * Pourquoi limiter l'end-to-end aux parcours critiques ?
 *  - LENT : chaque étape attend le rendu réel (navigateur + réseau + WebDriver),
 *    soit des secondes là où un test unitaire coûte des millisecondes ; une
 *    suite e2e exhaustive se joue en heures et n'est plus lancée à chaque commit.
 *  - FRAGILE : le spec dépend de sélecteurs de composants, de libellés et de
 *    délais de rendu ; un changement de layout ou de thème casse des tests qui
 *    ne détectent aucune régression fonctionnelle (faux positifs coûteux).
 *  - REDONDANT : la logique (formulas, stores, proxys) est déjà couverte en
 *    unitaire (specs Lab 8). L'e2e n'apporte de valeur QUE sur l'assemblage :
 *    ici, le pivot maître-détail arbre → journal → persistance, LE parcours
 *    qu'un utilisateur de VIGIE exerce à chaque session.
 */
describe('VIGIE - parcours critique maître-détail', function () {

    it('filtre le journal sur « Vanne V-3 » et persiste un acquittement', function () {

        // 1. Application chargée : l'arbre des sites a reçu ses nœuds.
        ST.component('#arbreSites')
            .visible()
            .wait(function (tree) {
                return tree.getStore().getRoot().childNodes.length > 0;
            });

        // 2. Sélectionner « Vanne V-3 » dans l'arbre (clic utilisateur réel).
        ST.grid('#arbreSites')          // un treepanel EST une grille pour ST
            .rowWith('text', 'Vanne V-3')
            .reveal()
            .click();

        // 3. Le journal ne montre plus que les alarmes de cet équipement.
        ST.grid('journal-alarmes')
            .wait(function (grid) {
                return grid.getStore().isFiltered();
            })
            .and(function (grid) {
                grid.getStore().each(function (rec) {
                    expect(rec.get('equipementId')).toBe(2);
                });
            });

        // 4. Acquitter la première alarme non acquittée : clic sur la
        //    checkcolumn (cellediting 1 clic), autoSync pousse le PATCH.
        ST.grid('journal-alarmes')
            .rowWith('acquittee', false)
            .cellWith('dataIndex', 'acquittee')
            .click();

        // 5. Persistance : attendre la fin du sync (plus d'enregistrement
        //    modifié), puis RECHARGER l'application - seul un vrai aller-retour
        //    serveur peut prouver la persistance de bout en bout.
        ST.wait(function () {
            return Ext.StoreManager.lookup('alarmes').getModifiedRecords().length === 0;
        });

        ST.navigate('/');               // recharge l'app (session WebDriver)

        ST.grid('journal-alarmes')
            .rowWith('message', 'Pression basse')   // l'alarme acquittée en 4.
            .and(function (row) {
                expect(row.getRecord().get('acquittee')).toBe(true);
            });
    });
});
