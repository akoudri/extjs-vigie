# Tests unitaires VIGIE (Lab 8)

Specs **Jasmine portables** (indépendantes de Sencha Test, qui est commercial) :

- `specs/MainModel.spec.js` — la formula `enDefaut` du ViewModel (DEFAUT → true, OK → false).
- `specs/Equipements.spec.js` — chargement du store via un proxy `memory` mocké.
- `specs/EquipementsRest.spec.js` — **(extension E2)** chargement à travers le
  **vrai proxy `rest`** du Model, réponses simulées par `Ext.ux.ajax.SimManager`
  (voir `support/sim-init.js` : hook adapté à ExtJS 8, où l'XHR est créé par
  `Ext.data.request.Ajax` et non plus `Ext.data.Connection`).

Ce sont des tests de **logique** : ils instancient directement les classes
(`new` / `Ext.create`), sans monter d'UI. `notify()` force l'évaluation
synchrone des formulas.

## Rejouer les tests

Les classes VIGIE/ExtJS étant fournies par le build (webpack), le plus simple
est de charger Jasmine dans l'application en cours d'exécution, puis d'exécuter
les specs.

1. Lancer l'app : `./dev.sh` (http://localhost:1962) et json-server : `./mock.sh`.
2. Ouvrir la console du navigateur sur l'app et coller :

```javascript
(async () => {
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jasmine-core@5.1.1/lib/jasmine-core/jasmine.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  const jasmine = window.jasmineRequire.core(window.jasmineRequire);
  const env = jasmine.getEnv();
  const ji = window.jasmineRequire.interface(jasmine, env);
  ['describe','it','expect','beforeEach','afterEach','beforeAll','afterAll'].forEach(k => window[k] = ji[k]);
  // E2 : classes Ext.ux.ajax.* (absentes des packages npm), reprises des
  // ressources de test d'ext-core, puis leur adaptation ExtJS 8.
  const UX = '/node_modules/@sencha/ext-core/test/resources/ux/ajax/';
  for (const f of [
    UX + 'Simlet.js', UX + 'DataSimlet.js', UX + 'JsonSimlet.js',
    UX + 'SimXhr.js', UX + 'SimManager.js',
    '/test/support/sim-init.js',
    '/test/specs/MainModel.spec.js',
    '/test/specs/Equipements.spec.js',
    '/test/specs/EquipementsRest.spec.js'
  ]) {
    (0, eval)(await (await fetch(f)).text());
  }
  env.addReporter({ specDone: r => console.log(r.status === 'passed' ? '✓' : '✗', r.fullName,
    ...(r.failedExpectations || []).map(f => f.message)) });
  env.execute();
})();
```

Résultat attendu (vérifié) — **4 specs au vert** :

```
✓ VIGIE MainModel enDefaut est vrai pour un équipement en DEFAUT
✓ VIGIE MainModel enDefaut est faux pour un équipement OK
✓ VIGIE.store.Equipements charge des enregistrements depuis le proxy
✓ VIGIE.store.Equipements via proxy rest simulé (E2) charge les enregistrements à travers le proxy rest réel
```

> Avec Sencha Test (commercial), ces mêmes specs Jasmine se chargent telles
> quelles dans un scénario unitaire pointant le build de dev.

## Extension E1 - end-to-end maître-détail

- `e2e/MaitreDetail.st.js` — esquisse Sencha Test (futures `ST.*`, WebDriver),
  avec la discussion « pourquoi limiter l'e2e aux parcours critiques ».
- `e2e/maitre-detail.portable.js` — même parcours, exécutable sans Sencha
  Test : à coller dans la console **sur le build de production**
  (`cd build/production/VIGIE && python3 -m http.server 8088`), json-server
  actif. Sur l'app de dev (1962), le PATCH d'acquittement écrit `mock/db.json`
  et le liveReload webpack recharge la page avant la fin du scénario.

## Extension E3 - mesures de build

`../measure-build.sh` compare les tailles development/production et la part
du package `charts` ; résultats et temps de démarrage : `MESURES.md`.
