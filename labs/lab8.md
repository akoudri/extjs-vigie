# Lab 8 - Build & tests

> Fil rouge **VIGIE** · Associé au Module 8 (Industrialisation)
> Durée indicative : ~55 min (socle) · extension auto-rythmée · **dernier lab du parcours**

---

## Contexte

VIGIE est complète et fonctionne sous `app watch`. Ce lab en fait un **livrable** : recensement des packages, build de production reproductible, et premiers **tests unitaires** sur la logique (une formula de ViewModel, un store).

À l'issue, un build de production démarre, et deux tests passent - la console est prête à être livrée.

> Note de continuité : ce lab solde la **dette de packages** accumulée depuis le Module 5 (`exporter`), le Module 6 (`charts`) et le Module 7 (thème, locale).

---

## Prérequis

- **Lab 7 livré** : VIGIE en SPA routée, responsive, libellés externalisés.
- **Module 8 vu** : build de production, app.json, tests (ViewModel, stores, proxies mockés).
- Outil de test : **Sencha Test** (recommandé) ou un runner Jasmine autonome (voir Pièges).

```bash
cd vigie
sencha app watch
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Recenser les packages dans `app.json`

Déclarer toutes les dépendances accumulées, sinon elles manqueront au build de production :

```javascript
// app.json
"requires": [ "exporter", "charts" ],
"theme":  "theme-vigie",
"locale": "fr"
```

Rafraîchir puis vérifier que l'app de dev démarre toujours :

```bash
sencha app refresh
sencha app watch
```

- [ ] L'export de grille (Module 5) et le chart (Module 6) fonctionnent toujours en dev.
- [ ] Le thème de marque et la locale `fr` sont appliqués.

### Étape 2 - Produire un build de production

```bash
sencha app build               # build de production
```

Servir le résultat et vérifier qu'il démarre :

```bash
cd build/production/VIGIE
npx http-server -p 8080        # ou tout serveur statique
```

- [ ] `build/production/VIGIE/` contient `index.html`, `app.js`, `resources/`.
- [ ] Le build de production démarre dans le navigateur (mock json-server toujours actif).

### Étape 3 - Tester une formula de ViewModel

S'assurer que `MainModel` porte la formula `enDefaut` (elle était en extension au Module 3 ; l'ajouter sinon) :

```javascript
// MainModel.formulas
enDefaut: function (get) {
    var e = get('equipementCourant');
    return !!e && e.get('etat') === 'DEFAUT';
}
```

Écrire la spec `test/specs/MainModel.spec.js` :

```javascript
describe('VIGIE MainModel', function () {
    it('enDefaut est vrai pour un équipement en DEFAUT', function () {
        var vm = new VIGIE.view.main.MainModel();
        vm.set('equipementCourant',
            new VIGIE.model.Equipement({ nom: 'V-3', etat: 'DEFAUT' }));
        vm.notify();                       // force l'évaluation des bindings
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
```

- [ ] Les deux assertions sur `enDefaut` passent.

### Étape 4 - Tester un store, proxy mocké

Écrire `test/specs/Equipements.spec.js`. Un proxy `memory` isole le test du réseau :

```javascript
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
```

- [ ] Le test de chargement du store passe (deux enregistrements, état lu correctement).

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Un scénario maître-détail de bout en bout

Avec Sencha Test (WebDriver), écrire un test end-to-end du parcours critique :

1. charger l'application ;
2. sélectionner « Vanne V-3 » dans l'arbre ;
3. vérifier que le journal ne montre que les alarmes de cet équipement ;
4. acquitter une alarme et vérifier la persistance.

Esquisser le spec (sélecteurs de composants, attentes). **Discuter** : pourquoi limiter l'end-to-end aux parcours critiques (lenteur, fragilité) ?

### E2 - Isoler par un mock de proxy

Plutôt que de pointer json-server, simuler les réponses HTTP avec `Ext.ux.ajax.SimManager` : le store exerce alors son **vrai** proxy `rest` (URL, reader, writer) sans serveur. Écrire une simulation pour `/equipements` et tester le chargement via le proxy réel.

### E3 - Mesurer le build (graduée)

Comparer le build `development` et `production` : taille des bundles, temps de démarrage (premier rendu). Vérifier l'effet de `requires` propres sur la taille finale.

---

## Pièges & indices

- **Packages = noms, pas chemins** : `"requires": ["exporter", "charts"]` référence des packages ; relancer `sencha app refresh` après modification d'`app.json`.
- **URL d'API en dur** : les proxys pointent `localhost:3000`. Pour un vrai build de prod, **variabiliser** l'endpoint par environnement, sinon la prod interroge le mock.
- **Tests de logique = pas d'UI** : instancier directement les classes (`new` / `Ext.create`) ; inutile de monter la vue.
- **`notify()`** force l'évaluation synchrone des formulas en test - sans lui, le binding est asynchrone et l'assertion échoue.
- **Proxy `memory`** : données fournies en dur, lecture synchrone, aucun réseau - l'isolant idéal pour un test de store.
- **Sencha Test est commercial** : les specs Jasmine restent **portables**. À défaut, un runner Jasmine autonome peut charger le build de dev et les classes sous test.
- **End-to-end ≠ tout tester** : lent et fragile ; le réserver aux parcours critiques, la logique étant couverte en unitaire.

---

## Livrable

VIGIE, prête pour la production :
- `app.json` - packages, thème et locale recensés ;
- `build/production/VIGIE/` - build qui démarre ;
- `test/specs/MainModel.spec.js` + `test/specs/Equipements.spec.js` - deux specs qui passent ;
- *(extension)* test end-to-end, simulation de proxy, mesures de build.

> **Checkpoint atteint** : le build de production démarre (packages inclus), un test de formula et un test de store passent, la check-list de performance a été parcourue. **Dépôt VIGIE final** fourni : sources, mock, build et tests.

---

## Fin du parcours

Le fil rouge **VIGIE** est complet : d'une classe vide (Lab 1) à une console de supervision **routée, responsive, thémée, internationalisée, buildée et testée**. Chaque demi-journée a fait grandir le même artefact - c'est cette continuité qui transforme une liste de sujets ExtJS en une trajectoire.
