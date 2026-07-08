/**
 * Lab 8 - Extension E1 : scénario maître-détail exécutable SANS Sencha Test.
 *
 * Version portable de MaitreDetail.st.js : à coller dans la console du
 * navigateur sur l'application. Pilote les VRAIS composants (ComponentQuery,
 * clic DOM sur la checkcolumn) ; la persistance est vérifiée par un GET
 * direct sur l'API mock (json-server actif).
 *
 * L'exécuter sur le BUILD DE PRODUCTION servi statiquement (voir Lab 8,
 * http://localhost:8088) : sur l'app de dev (1962), le PATCH d'acquittement
 * écrit mock/db.json et le liveReload webpack recharge la page AVANT la fin
 * du scénario (vérifié) - un e2e a besoin d'une cible stable, argument de
 * plus pour le jouer contre un livrable et non un poste de dev.
 */
(async function () {
    var echecs = 0;

    function verifier(ok, msg) {
        console.log((ok ? '✓' : '✗') + ' [E2E] ' + msg);
        if (!ok) { echecs++; }
    }

    function attendre(cond, libelle, timeout) {
        timeout = timeout || 8000;
        return new Promise(function (resolve, reject) {
            var debut = Date.now();
            (function boucle() {
                var v;
                try { v = cond(); } catch (e) { v = false; }
                if (v) { return resolve(v); }
                if (Date.now() - debut > timeout) {
                    return reject(new Error('[E2E] timeout : ' + libelle));
                }
                setTimeout(boucle, 50);
            }());
        });
    }

    // 1. Application chargée : l'arbre des sites a reçu ses nœuds.
    var arbre = await attendre(function () {
        var t = Ext.ComponentQuery.query('#arbreSites')[0];
        return t && t.getStore().getRoot().childNodes.length && t;
    }, "chargement de l'arbre");

    // 2. Sélectionner « Vanne V-3 » (déclenche onNodeSelect, comme un clic).
    var noeud = arbre.getStore().findNode('text', 'Vanne V-3');
    verifier(!!noeud, "le nœud « Vanne V-3 » existe dans l'arbre");
    arbre.getSelectionModel().select(noeud);

    // 3. Le journal ne montre plus que les alarmes de cet équipement.
    var journal = Ext.ComponentQuery.query('journal-alarmes')[0],
        alarmes = journal.getStore(),
        id = noeud.get('equipementId');

    await attendre(function () { return alarmes.isFiltered(); }, 'filtrage du journal');

    var source = alarmes.getData().getSource(),   // collection NON filtrée
        attendues = 0;
    source.each(function (rec) {
        if (rec.get('equipementId') === id) { attendues++; }
    });

    verifier(alarmes.getCount() === attendues && attendues < source.getCount(),
        'journal filtré : ' + alarmes.getCount() + '/' + source.getCount() +
        ' alarmes (équipement ' + id + ')');

    var etrangere = false;
    alarmes.each(function (rec) {
        if (rec.get('equipementId') !== id) { etrangere = true; }
    });
    verifier(!etrangere, "aucune alarme d'un autre équipement affichée");

    // 3 bis. La sélection alimente aussi le ViewModel : V-3 est en DEFAUT.
    var vm = journal.up('app-main').getViewModel();
    await attendre(function () { return vm.get('equipementCourant'); },
        'équipement courant dans le ViewModel');
    vm.notify();
    verifier(vm.get('enDefaut') === true,
        'formula enDefaut réagit à la sélection (V-3 en DEFAUT)');

    // 4. Acquitter une alarme PAR LA GRILLE (clic DOM sur la checkcolumn) et
    //    vérifier la persistance côté serveur (store autoSync → PATCH).
    var rec = null;
    alarmes.each(function (r) {
        if (!r.get('acquittee')) { rec = r; return false; }
    });
    verifier(!!rec, 'une alarme non acquittée est disponible');

    var cellule = journal.getView().getCell(rec, journal.down('checkcolumn'));
    cellule = cellule.dom || cellule;             // Element ou nœud selon version
    cellule.querySelector('.x-grid-checkcolumn').click();

    await attendre(function () { return rec.get('acquittee') && !rec.dirty; },
        "PATCH d'acquittement (autoSync)");

    var distant = await fetch('http://localhost:3000/alarmes/' + rec.getId())
        .then(function (r) { return r.json(); });
    verifier(distant.acquittee === true,
        'acquittement persisté côté serveur (alarme ' + rec.getId() + ')');

    // 5. Remise en état : on rend la donnée intacte au scénario suivant.
    rec.set('acquittee', false);
    await attendre(function () { return !rec.dirty; }, 'PATCH de remise en état');

    console.log(echecs
        ? '✗ [E2E] scénario maître-détail : ' + echecs + ' échec(s)'
        : '✓ [E2E] scénario maître-détail : OK');
}());
