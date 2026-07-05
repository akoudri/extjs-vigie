# Reproduire les labs VIGIE - difficultés & contournements

Cette note recense les frictions rencontrées en **implémentant réellement** les 8 labs,
et comment les lever. La plupart sont des **contraintes d'environnement** (machine sans
licence Sencha à jour, JDK/OpenSSL récents, ExtJS 8) - **pas** des erreurs des énoncés,
qui restent corrects pour leur cible (Sencha Cmd 6/7 + Ext JS licencié). La seule
correction de *code* d'un lab concerne la route du Lab 7 (voir plus bas).

Environnement de référence de cette implémentation : Linux, Node 22 (système) + Node 20
(embarqué avec Sencha Cmd), **Ext JS 8 / Sencha Cmd 8 installés via npm**, build **webpack**
(`@sencha/ext-webpack-plugin`) au lieu du build classique `sencha app watch`/`app build`.

---

## 1. Chaîne d'outils : Sencha Cmd ne s'installe pas « comme avant »

- `sencha generate app -ext VIGIE ./vigie` (commande des labs) **échoue** avec la
  distribution **npm** de Sencha Cmd 8 : `[ERR] Cannot find file: …/repo/.sencha/codegen.json`
  (le paquet npm ne sait pas télécharger/extraire le framework).
- **Contournement** : générer l'application avec **`ext-gen`** (le générateur officiel
  livré avec Cmd 8), qui tire le framework depuis le **npm public** (`@sencha/ext*`),
  sans login :
  ```bash
  ext-gen app -t classicdesktop -n VIGIE
  ```
- `ext-gen` produit un projet **webpack** (`npm start` ≈ `sencha app watch`,
  `npm run build` ≈ `sencha app build`) et une arborescence différente de celle des
  labs (`app/desktop/src/view/main/MainView.js`, namespace = nom d'app). On la
  **reconfigure** pour coller aux énoncés :
  - `app.json` → `"classpath": ["app"]`, `"namespace": "VIGIE"` ;
  - fichiers à plat : `app/view/main/Main.js`, `app/model/…`, `app/store/…` ;
  - `app/sass/var.scss` + `app/sass/src.scss` (référencés par `app.json`).

## 2. Java : Sencha Cmd 8 exige **JDK 8**

- Avec **Java 25** (défaut courant), toute commande de build casse :
  `[ERR] 'void sun.misc.Unsafe.ensureClassInitialized(java.lang.Class)'`
  (méthode retirée depuis le JDK 9).
- **JDK 11/17/21/25 ne suffisent pas** non plus (même méthode absente). Il faut un **JDK 8**.
  ```bash
  source ~/.sdkman/bin/sdkman-init.sh
  sdk install java 8.0.492-tem
  ```
- ⚠️ `SENCHA_CMD_JAVA_HOME` **seul n'est pas honoré** par le lanceur natif de Cmd 8.
  Exporter **`JAVA_HOME` + `PATH`** (c'est ce que font `dev.sh` / `build-prod.sh`) :
  ```bash
  export JAVA_HOME="$HOME/.sdkman/candidates/java/8.0.492-tem"
  export SENCHA_CMD_JAVA_HOME="$JAVA_HOME"
  export PATH="$JAVA_HOME/bin:$PATH"
  ```

## 3. Build de production : PhantomJS + OpenSSL 3

- `npm run build` (= `sencha app build`) **plante au slicing d'images legacy** :
  `[ERR] … DSO support routines:DLFCN_LOAD:could not load the shared library … (libprovider…)`
  - PhantomJS (bundlé avec Cmd) est lié à une **vieille OpenSSL** incompatible avec
  l'OpenSSL 3 du système.
- **Contournement** : neutraliser le chargement du provider fautif :
  ```bash
  export OPENSSL_CONF=/dev/null
  ```
  Le build passe alors entièrement (slicing inclus). ⚠️ **Ne pas** poser
  `QT_QPA_PLATFORM=offscreen` : le PhantomJS bundlé n'a que sa plateforme « phantom »
  et planterait (`could not find Qt platform plugin "offscreen"`).
- Le **dev** (`npm start`) n'est pas concerné : le slicing n'a lieu qu'en production.

## 4. Tree-shaking de production : déclarer les `requires`

En **build de production**, les classes référencées **par chaîne** (non détectables
statiquement) sont éliminées → `TypeError: c is not a constructor` au démarrage. À
déclarer explicitement en `requires` dans les vues :

- plugins : `Ext.grid.plugin.CellEditing` (`ptype:'cellediting'`), `Ext.plugin.Responsive`
  (`plugins:'responsive'`) ;
- colonnes/feature : `Ext.grid.column.Check` (`checkcolumn`), `Ext.grid.feature.Grouping` ;
- chart : `Ext.chart.CartesianChart`, `Ext.chart.series.Line`, `Ext.chart.axis.Numeric|Time` ;
- **stores référencés par alias** `type:'…'` : `VIGIE.store.Equipements|Arborescence|Alarmes|Mesures`.

> Avec le build **classique** `sencha app build`, l'analyseur de Cmd détecte souvent
> ces alias automatiquement ; le besoin est plus marqué avec le tree-shaking **webpack**.
> Quoi qu'il en soit, des `requires` explicites est une bonne pratique.

## 5. Packages : `charts` OK, `exporter`/`locale` indisponibles

- **charts** (Lab 6) : pas livré par défaut, mais **installable depuis le npm public** :
  ```bash
  npm install @sencha/ext-charts@8.0.0
  ```
  puis `"requires": ["font-awesome", "charts"]` dans `app.json` + **redémarrer** le dev
  server (un nouveau package n'est pas pris à chaud).
- **exporter** (Lab 5, export Excel `gridexporter`/`saveDocumentAs`) : package
  **commercial**, absent du npm public → **non installable** ici. Substitut implémenté :
  **export CSV côté client** (UTF-8 + BOM, ouvrable dans Excel) dans `Journal.exportCsv`.
- **Package de locale** (Lab 7, `"locale": "fr"`) : indisponible hors registre Sencha.
  Substitut : `app/Locale.js`, un override FR maison (noms de jours/mois, boutons
  `MessageBox`, séparateurs). Les **libellés applicatifs** restent externalisés via
  `app/Libelles.js` (objectif principal du lab atteint).

## 6. Pièges de code rencontrés

- **Singleton référencé dans un littéral de config** : `title: VIGIE.Libelles.JOURNAL`
  écrit directement dans le corps de classe est évalué **à la définition** - le
  singleton peut ne pas être encore défini dans le bundle webpack → `Cannot read
  properties of undefined`. **Le faire dans `initComponent`** (instanciation : toutes
  les classes sont chargées). Cf. `Journal.js`, `Main.js`.
- **Route `:id` (Lab 7)** - *correction de code du lab* :
  - condition `'[0-9]+'` → **`'([0-9]+)'`** (groupe capturant), sinon `:id` arrive
    `undefined` dans l'action ;
  - **deep-link à froid** (`#equipement/2` au démarrage) : différer la sélection sur
    l'événement `load` du `TreeStore` (sinon `findChild` renvoie `null`).

  C'est la **seule modification de code** apportée à un énoncé (voir `lab7.md`).

## 7. API mock json-server

- Les labs ciblent **json-server 0.17.x** (`--watch`, CRUD complet, filtres `?clé=val`) :
  ```bash
  npx json-server@0.17.4 --watch mock/db.json --port 3000
  ```
  json-server **v1+** a une CLI différente (`json-server mock/db.json`, sans `--watch`).
- `autoSync` + proxy `rest` en **PATCH** persiste réellement dans `db.json` (json-server
  réécrit le fichier). Penser à **réinitialiser le seed** avant un commit déterministe.

## 8. Vérification

Faute de Sencha Inspector/Test exploitables ici, chaque lab a été **vérifié dans un
navigateur headless** (Playwright) : rendu + **console sans erreur**, plus interactions
(clics, sélection d'arbre, deep-link, resize responsive). Les **specs Jasmine** du Lab 8
sont rejouables via le harness de `vigie/test/README.md` (3 specs au vert).

---

## Récapitulatif des scripts fournis

| Script | Rôle |
|---|---|
| `vigie/dev.sh` | Dev server (JDK 8) - équivalent `sencha app watch`, http://localhost:1962 |
| `vigie/mock.sh` | API mock json-server, port 3000 |
| `vigie/build-prod.sh` | Build de production (JDK 8 + `OPENSSL_CONF=/dev/null`) |
| `vigie/test/README.md` | Rejeu des specs Jasmine |
