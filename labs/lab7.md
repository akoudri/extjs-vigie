# Lab 7 - SPA routée, responsive & thémée

> Fil rouge **VIGIE** · Associé au Module 7 (SPA & UX)
> Durée indicative : ~55 min (socle) · extension auto-rythmée

---

## Contexte

Le dashboard du Lab 6 est complet mais figé : une seule URL, une mise en page fixe, des libellés codés en dur. Ce lab le transforme en **SPA** : navigable par URL (deep-link vers un équipement), **responsive**, et avec ses **libellés externalisés** - premier pas vers l'internationalisation.

À l'issue, coller une URL `#equipement/2` rouvre VIGIE sur le bon équipement, et la mise en page s'adapte à la largeur.

> Note de continuité : le routage se branche sur le `onNodeSelect` du Module 6 sans le réécrire - la route **sélectionne** un nœud, et la sélection **met à jour** l'URL.

---

## Prérequis

- **Lab 6 livré** : dashboard opérationnel (arbre `reference: 'arbre'`, `onNodeSelect` câblé).
- **Module 7 vu** : routes, responsive, thèmes, i18n.

```bash
cd vigie
sencha app watch
npx json-server@0.17.4 --watch mock/db.json --port 3000
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Un contrôleur de navigation & une route

Créer `app/controller/Navigation.js`. Ce contrôleur d'application (pas un ViewController) porte les routes et la synchronisation d'URL.

```javascript
Ext.define('VIGIE.controller.Navigation', {
    extend: 'Ext.app.Controller',

    routes: {
        'equipement/:id': {
            action: 'onEquipementRoute',
            // GROUPE CAPTURANT obligatoire : sans les parenthèses, la valeur
            // de :id n'est pas transmise à l'action (la condition par défaut
            // d'ExtJS inclut déjà les parenthèses).
            conditions: { ':id': '([0-9]+)' }
        }
    },

    control: {
        'app-main treepanel': { select: 'onTreeSelect' }
    },

    // URL → sélection (différée si l'arbre n'est pas encore chargé : cas du
    // deep-link au démarrage, où le TreeStore se charge encore de façon async).
    onEquipementRoute: function (id) {
        var tree = Ext.first('app-main treepanel');
        if (!tree) { return; }

        var store = tree.getStore(),
            select = function () {
                var node = store.getRoot()
                                .findChild('equipementId', parseInt(id, 10), true);
                if (node) { tree.getSelectionModel().select(node); }
            };

        if (store.getRoot() && store.getRoot().hasChildNodes()) {
            select();
        } else {
            store.on('load', select, null, { single: true });
        }
    },

    // sélection → URL
    onTreeSelect: function (tree, node) {
        if (node.get('type') === 'equipement') {
            this.redirectTo('equipement/' + node.get('equipementId'));
        }
    }
});
```

> **Correctif de reproduction** (vérifié) : deux ajustements par rapport à la
> version initiale de ce lab. (1) La condition de route doit utiliser un **groupe
> capturant** `'([0-9]+)'` ; avec `'[0-9]+'`, `:id` arrive `undefined` dans
> l'action. (2) Au **deep-link à froid** (`#equipement/2` collé au démarrage),
> le `TreeStore` n'est pas encore chargé → `findChild` renvoie `null` ; on
> **diffère** donc la sélection sur l'événement `load` du store. Détails et autres
> pièges d'environnement : voir [REPRODUCTION.md](REPRODUCTION.md).

Enregistrer le contrôleur dans l'`Application` (`app.js`) :

```javascript
controllers: ['Navigation']
```

- [ ] Coller `http://localhost:1841/#equipement/2` sélectionne « Vanne V-3 » et met à jour le dashboard.
- [ ] La route `#equipement/abc` est ignorée (contrainte `[0-9]+`).

### Étape 2 - Synchroniser l'URL avec la sélection

La synchronisation est déjà assurée par `onTreeSelect` : sélectionner un équipement dans l'arbre met l'URL à jour. Vérifier que les deux sens fonctionnent **sans boucle** (un `redirectTo` vers le hash courant n'est pas redéclenché).

- [ ] Cliquer un équipement dans l'arbre fait apparaître `#equipement/:id` dans la barre d'adresse.
- [ ] Le bouton « Précédent » du navigateur renavigue dans l'historique des sélections.

### Étape 3 - Rendre la mise en page responsive

Rendre l'arbre et le chart adaptatifs selon la place disponible. Ajouter le plugin `responsive` et des règles :

```javascript
// région ouest (arbre)
plugins: 'responsive',
responsiveConfig: {
    'width < 900':  { width: 180 },
    'width >= 900': { width: 280 }
}
```

```javascript
// chart de télémétrie
plugins: 'responsive',
responsiveConfig: {
    'height < 700':  { height: 160 },
    'height >= 700': { height: 220 }
}
```

- [ ] Réduire la fenêtre rétrécit le panneau « Sites » et le chart ; l'agrandir les restaure.

### Étape 4 - Externaliser les libellés

Créer `app/Libelles.js`, un singleton centralisant les libellés applicatifs :

```javascript
Ext.define('VIGIE.Libelles', {
    singleton: true,
    SITES:       'Sites',
    JOURNAL:     "Journal d'alarmes",
    CONFIG:      'Configuration',
    ENREGISTRER: 'Enregistrer',
    EXPORTER:    'Exporter (Excel)'
});
```

Remplacer les chaînes en dur des vues par ces références (avec `requires: ['VIGIE.Libelles']`) :

```javascript
title: VIGIE.Libelles.JOURNAL        // au lieu de "Journal d'alarmes"
```

- [ ] Plus aucun libellé d'interface n'est codé en dur dans les vues principales.
- [ ] La locale ExtJS est chargée pour les composants natifs : `"locale": "fr"` dans `app.json`.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Un thème de marque via Fashion

Générer un thème dérivé de Triton, puis le pointer dans `app.json` :

```javascript
"theme": "theme-vigie"
```

Dans `theme-vigie/sass/var/all.scss`, surcharger les variables aux couleurs VIGIE :

```scss
$base-color: #2BB3AD;          // sarcelle (télémétrie)
$base-highlight-color: #F2A340; // ambre (balise)
```

Avec `sencha app watch`, **Fashion** recompile à la volée : modifier une variable et observer le rendu se mettre à jour sans rebuild complet.

### E2 - Une seconde locale (EN) commutable

Ajouter un jeu de libellés anglais et un commutateur. Approche pragmatique :

```javascript
Ext.define('VIGIE.LibellesEN', {
    singleton: true,
    SITES: 'Sites', JOURNAL: 'Alarm log', CONFIG: 'Configuration',
    ENREGISTRER: 'Save', EXPORTER: 'Export (Excel)'
});
```

Prévoir un bouton qui recharge l'app avec `?locale=en` (et sélectionne le bon singleton + le package de locale ExtJS correspondant). **Discuter** : pourquoi l'i18n des dates/validations relève du package de locale, pas du singleton de libellés ?

### E3 - Adapter le dashboard au mobile (graduée)

Pousser le responsive plus loin : sous un seuil étroit, basculer l'arbre de la région ouest vers une région nord repliée (ou un menu), et empiler chart/journal. Esquisser ce que changerait un build **modern** pour une vraie cible tactile.

---

## Pièges & indices

- **Routes sur un contrôleur d'application** : les `routes` vivent sur un `Ext.app.Controller` enregistré dans l'`Application` - pas sur un ViewModel ni, ici, un ViewController.
- **Pas de boucle route ↔ sélection** : `redirectTo` vers le hash déjà courant n'est pas redéclenché ; la double liaison est donc stable. En cas de doute, garder le dernier `id` routé et court-circuiter.
- **Sélection programmatique** : `getSelectionModel().select(node)` émet `select` ; sélectionner un nœud déjà sélectionné ne réémet pas - cohérent avec la boucle.
- **`findChild` récursif** : `getRoot().findChild('equipementId', id, true)` - le 3ᵉ argument `true` active la recherche en profondeur.
- **Plugin responsive** : `plugins: 'responsive'` est requis sur chaque composant concerné ; les règles sont évaluées au redimensionnement.
- **Libellés ≠ i18n complète** : un singleton FR n'internationalise pas les composants natifs (formats de date, messages de validation) - c'est le rôle du **package de locale** (`"locale"` dans `app.json`).
- **Contrainte de route** : `':id': '[0-9]+'` évite qu'une URL malformée ne déclenche le handler.

---

## Livrable

VIGIE en SPA :
- `app/controller/Navigation.js` - route `equipement/:id`, synchronisation URL ↔ sélection ;
- mise en page **responsive** (arbre, chart) ;
- `app/Libelles.js` - libellés externalisés ; locale `fr` chargée ;
- *(extension)* thème de marque Fashion, locale EN commutable, adaptation mobile.

> **Checkpoint atteint** : VIGIE est navigable par URL (un lien rouvre le bon équipement), la mise en page s'adapte à la largeur, les libellés sont externalisés et la locale chargée. Dépôt de référence (état fin D7) fourni pour resynchronisation.

**Suite - Lab 8 (Industrialisation)** : recensement des **packages** (`exporter`, `charts`, thème) dans `app.json`, **build de production** reproductible, **tests** unitaires (ViewModel & stores) et bilan de **performance**.
