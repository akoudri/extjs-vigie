# VIGIE - Fil rouge ExtJS (labs lab1 → lab8)

Implémentation progressive de **VIGIE**, console de supervision construite au fil des
8 labs (`labs/lab1.md` … `labs/lab8.md`). Un commit + un tag git par lab (`lab1` … `lab8`).

## Pile technique

- **ExtJS 8** (toolkit *classic*), application générée par **ext-gen** (Sencha Cmd 8).
- Build de développement via **webpack** + `@sencha/ext-webpack-plugin` (équivalent de
  `sencha app watch`).
- À partir du Lab 4 : API mock **json-server** sur le port 3000.

### ⚠️ Sencha Cmd 8 exige **JDK 8**

Le poste tourne sous Java 25 par défaut, incompatible avec Sencha Cmd 8
(`sun.misc.Unsafe.ensureClassInitialized` retiré depuis JDK 9). Un JDK 8 est installé
via sdkman (`~/.sdkman/candidates/java/8.0.492-tem`) et forcé **uniquement pour Cmd**
par le script de lancement — le Java système n'est pas modifié.

## Lancer l'application

```bash
./dev.sh          # force JDK 8 puis `npm start` → http://localhost:1962
```

Le script `dev.sh` exporte `JAVA_HOME`/`SENCHA_CMD_JAVA_HOME` vers le JDK 8 puis
lance le dev server (rebuild incrémental + rechargement à chaud).

À partir du Lab 4, lancer aussi l'API mock dans un autre terminal :

```bash
./mock.sh     # json-server sur http://localhost:3000
```

## Build de production & tests (Lab 8)

```bash
./build-prod.sh                                   # build/production/VIGIE/
cd build/production/VIGIE && python3 -m http.server 8088   # http://localhost:8088
```

`build-prod.sh` force le JDK 8 et `OPENSSL_CONF=/dev/null` (sans quoi le slicer
d'images legacy, PhantomJS, plante sur OpenSSL 3). Les classes référencées par
chaîne (plugins, xtypes de chart, alias de stores) sont déclarées en `requires`
dans les vues pour survivre au tree-shaking de production.

Tests unitaires (Jasmine portable) : voir `test/README.md` - 3 specs au vert
(`MainModel.enDefaut` ×2, chargement de `store.Equipements` via proxy `memory`).

## Écarts assumés vs énoncés des labs

> 📋 Détail complet des frictions et contournements de reproduction :
> [labs/HELP.md](labs/HELP.md).

Les labs sont écrits pour le workflow Sencha Cmd 8 (`sencha generate app`,
`sencha app watch`, `sencha app build`). Adaptations sur ce poste :

- **Génération** : `ext-gen` au lieu de `sencha generate app` (la distribution npm de
  Cmd 8 ne télécharge pas le framework). Structure reconfigurée pour coller aux labs
  (`namespace VIGIE`, `classpath: ["app"]`, fichiers `app/view/main/Main.js`, etc.).
- **Watch** : `./dev.sh` (`npm start`) au lieu de `sencha app watch`.
- **Build de prod (Lab 8)** : fonctionne via `build-prod.sh` (JDK 8 +
  `OPENSSL_CONF=/dev/null` pour le slicer PhantomJS).
- **Export Excel (Lab 5)** : le package commercial `exporter` n'est pas disponible
  hors registre Sencha → export **client-side CSV** documenté dans le code.
- **Locale (Lab 7)** : le package de locale Sencha étant indisponible, un override
  FR maison (`app/Locale.js`) couvre les composants natifs ; les libellés sont
  externalisés via `app/Libelles.js`.
- **Thème** : `theme-material` par défaut (le thème de marque Fashion du Lab 7-E1
  est une extension non requise).

Chaque lab est vérifié dans un navigateur (rendu + console sans erreur) avant son commit.
