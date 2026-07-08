# Lab 8 - Extension E3 : mesures development vs production

Mesures relevées le 08/07/2026 (Chromium, localhost, cache désactivé, une
passe par cible - ordres de grandeur, pas un banc de perf). Tailles :
`../measure-build.sh`. Démarrage : Performance API, l'instant retenu est le
**premier rendu de `app-main`** (l'écran LOADING… compte comme premier paint,
il ne dit rien d'utile).

## Taille des bundles

| | development (`app watch`) | production (`build-prod.sh`) |
|---|---|---|
| JavaScript | 12 166 Ko en 1 046 fichiers sources | **2 004 Ko** en 1 bundle (582 Ko gzip) |
| CSS | 4 feuilles générées (~570 Ko) | 404 Ko compilé/minifié |
| Livrable complet | n/a (servi depuis les sources) | 7 580 Ko (avec resources/, fonts, images) |

## Démarrage (navigation → `app-main` rendue)

| | development (1962) | production (8088) |
|---|---|---|
| Requêtes | 612 | **16** |
| Octets transférés | ~10 200 Ko | ~2 790 Ko (*) |
| App rendue | ~990 ms | **~280 ms** |

(*) servi par `python3 -m http.server`, qui ne compresse pas ; avec gzip
(n'importe quel serveur réel), le JS descend à 582 Ko : l'écart en conditions
réelles est bien plus large que ce tableau local ne le montre.

L'essentiel du gain vient du **nombre de requêtes** (612 → 16) et de la
minification (facteur ~6 sur le JS), pas du réseau local : sur une vraie
liaison, chaque aller-retour du loader de dev coûterait des dizaines de ms.

## Effet des `requires` propres sur la taille

- Le package `charts` pèse **1 344 Ko de sources, soit 11,1 %** du JS chargé
  (mesure sur le `loadOrder` du manifest). C'est le prix du
  `"requires": ["charts"]` d'app.json - justifié ici (chart de télémétrie),
  mais tout package listé sans être utilisé serait embarqué au même tarif.
- Inversement, `exporter` n'est PAS dans `requires` (package commercial
  indisponible, export CSV maison au Lab 5) : aucun code mort embarqué.
- Le code VIGIE lui-même : 41 Ko, 0,3 % du total - une application ExtJS est
  presque entièrement du framework ; le dimensionnement du livrable se joue
  donc dans `requires`, pas dans `app/`.

## Pièges rencontrés (et corrigés) en produisant le build

1. **`npm run build` ignorait app.json** : ext-webpack-plugin applique ses
   propres défauts (`toolkit: modern`, `theme: theme-material`) au build Cmd.
   Le « build qui démarre » du socle était en réalité un build **modern +
   Material** approximatif (renderer sévérité échappé, pas de fil d'Ariane,
   thème de marque absent). Corrigé dans `build-prod.sh` :
   `--env toolkit=classic --env theme=theme-vigie --env packages=charts`.
2. **Classes référencées par alias chaîne élaguées du build** : en dev tout le
   framework est chargé ; en production, `plugins: 'responsive'`,
   `axes[].type`, `series[].type` et `store: { type: 'mesures' }` ne suffisent
   pas au compilateur → `TypeError: c is not a constructor` au démarrage.
   Corrigé par des `requires` explicites dans `Main.js` (Ext.plugin.Responsive,
   axes/série de chart, VIGIE.store.Mesures).
3. **Cache du microloader** : le manifest est mis en cache en `localStorage` ;
   après un rebuild, l'ancien bundle peut être rejoué. En cas de doute :
   `localStorage.clear()` + rechargement forcé.
4. **URL d'API en dur** (piège annoncé par l'énoncé, non corrigé ici) : les
   proxys pointent `http://localhost:3000` ; le build de production interroge
   donc le mock. Pour livrer réellement : variabiliser l'endpoint par
   environnement (ex. `Ext.manifest.env.apiBase` renseigné par profil de
   build, ou une constante substituée en CI).
