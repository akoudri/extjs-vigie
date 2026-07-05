# Lab 2 - Shell de VIGIE

> Fil rouge **VIGIE** · Associé au Module 2 (Composants, conteneurs & layouts)
> Durée indicative : ~50 min (socle) · extension auto-rythmée

---

## Contexte

Le **Lab 1** a posé les premières classes métier ; VIGIE n'avait encore aucune interface. Ce lab construit le **shell applicatif** : l'ossature visuelle dans laquelle viendront se loger, aux jours suivants, l'arbre des sites, les grilles et le dashboard.

L'objectif est de maîtriser le **système de layout** sur un cas réel - celui où ExtJS fait le plus souvent trébucher - et de produire un cadre stable et redimensionnable.

> Note de continuité : les gestionnaires d'événements sont ici écrits en **fonctions inline** (pas encore de logique applicative externalisée). Au **Module 3 (MVVM)**, ils migreront vers un **ViewController**, et l'événement métier amorcé en extension deviendra un **binding maître-détail**.

---

## Prérequis

- **Lab 1 livré** : l'application VIGIE démarre (`sencha app watch`), et les classes `VIGIE.domain.Equipement` / `VIGIE.util.SeuilTelemetrie` existent.
- **Module 2 vu** : conteneurs, cycle de vie, layouts (fit, vbox/hbox, border), panels/toolbars/windows, événements.

Reprendre depuis l'état fin D1 (ou le dépôt de référence fourni) :

```bash
cd vigie
sencha app watch     # http://localhost:1841
```

> L'application générée par Sencha Cmd définit déjà une vue principale `VIGIE.view.main.Main`, rendue plein écran via `mainView`. Ce lab la **restructure** ; inutile de créer un `Viewport` à la main.

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Transformer la vue principale en layout `border`

Éditer `app/view/main/Main.js` pour adopter un layout `border`. Conserver le contrôleur et le viewModel générés en place : ils ne servent pas encore, ils seront exploités au Module 3.

```javascript
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    controller: 'main',     // généré ; exploité au Module 3
    viewModel: 'main',      // généré ; exploité au Module 3

    layout: 'border',

    items: [
        {
            region: 'north',
            xtype: 'toolbar',
            height: 48,
            items: [
                { xtype: 'component', html: '<b>VIGIE</b> - Supervision' },
                { xtype: 'tbfill' },
                { xtype: 'textfield', emptyText: 'Filtrer…', width: 200 }
            ]
        },
        {
            region: 'west',
            title: 'Sites',
            width: 240,
            minWidth: 180,
            collapsible: true,
            split: true,
            bodyPadding: 8,
            html: '<i>Arbre des sites - à venir (Module 6)</i>'
        },
        {
            region: 'center',
            xtype: 'panel',
            itemId: 'contenu',
            layout: 'fit',
            bodyPadding: 12,
            html: 'Zone de contenu - grilles à venir (Modules 4–5)'
        }
    ]
});
```

- [ ] L'application affiche trois régions : barre nord, panneau « Sites » à l'ouest, contenu central.
- [ ] Le panneau ouest se **replie** (bouton de repli) et se **redimensionne** (splitter).

### Étape 2 - Ajouter la fenêtre modale « À propos »

Ajouter, dans la barre d'outils (après le `textfield`), un bouton qui ouvre une fenêtre modale. Le gestionnaire est une **fonction inline** (pas de ViewController à ce stade).

```javascript
{
    text: 'À propos',
    handler: function () {
        Ext.create('Ext.window.Window', {
            title: 'À propos de VIGIE',
            modal: true,
            width: 360,
            height: 200,
            layout: 'fit',
            items: [{
                xtype: 'component',
                padding: 16,
                html: 'VIGIE - console de supervision.<br>Édition de formation.'
            }]
        }).show();
    }
}
```

- [ ] Le bouton « À propos » ouvre une fenêtre centrée.
- [ ] La fenêtre est **modale** : l'arrière-plan est bloqué tant qu'elle est ouverte.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Un layout imbriqué (hbox dans vbox)

Remplacer le contenu de la région `center` par une composition : une barre de filtres à hauteur fixe au-dessus, puis une zone qui s'étire, contenant **deux panneaux côte à côte** en `hbox`.

```javascript
{
    region: 'center',
    xtype: 'panel',
    layout: { type: 'vbox', align: 'stretch' },
    items: [
        { xtype: 'panel', title: 'Filtres', height: 64 },
        {
            xtype: 'panel',
            flex: 1,
            layout: { type: 'hbox', align: 'stretch' },
            items: [
                { xtype: 'panel', title: 'Équipements', flex: 2 },
                { xtype: 'panel', title: 'Détail',      flex: 1 }
            ]
        }
    ]
}
```

Vérifier que les proportions (2 / 1) tiennent au redimensionnement de la fenêtre.

### E2 - Diagnostiquer un enfant invisible

Reproduire **volontairement** le piège classique : retirer `align: 'stretch'` du `vbox` ci-dessus. Observer que les panneaux enfants perdent leur largeur (rendu vide ou écrasé). Puis corriger.

- Sans `align: 'stretch'`, le `vbox` ne contraint pas l'axe transverse → largeur indéterminée.
- Restaurer `align: 'stretch'` (ou fixer une largeur) rétablit l'affichage.

Objectif : savoir **lire** le symptôme « l'enfant ne s'affiche pas » et remonter à la contrainte manquante.

### E3 - Émettre un événement métier depuis la barre d'outils

Réutiliser la classe `VIGIE.domain.Equipement` (Lab 1) pour publier un signal métier, en préfiguration du maître-détail du Module 3.

Déclarer la dépendance en tête de `Main.js` :

```javascript
requires: ['VIGIE.domain.Equipement'],
```

Ajouter un bouton dans la barre d'outils :

```javascript
{
    text: 'Sélectionner P-12',
    handler: function (btn) {
        var main = btn.up('app-main');
        var eq = Ext.create('VIGIE.domain.Equipement', { nom: 'Pompe P-12', etat: 'OK' });
        main.fireEvent('equipementchoisi', main, eq);
    }
}
```

Écouter l'événement (par exemple dans un `listeners` de la vue) et mettre à jour la zone centrale :

```javascript
listeners: {
    equipementchoisi: function (src, eq) {
        src.down('#contenu').setHtml(
            'Équipement : ' + eq.getNom() + ' [' + eq.getEtat() + ']'
        );
    }
}
```

Au Module 3, cet événement et cette mise à jour manuelle seront remplacés par un **binding** déclaratif.

---

## Pièges & indices

- **Pas de `Viewport` manuel** : `mainView` rend déjà `Main` en plein écran. En instancier un second provoque un affichage dédoublé ou vide.
- **`center` est obligatoire** en layout `border` ; son absence lève une erreur au rendu.
- **`split` sans `collapsible`** donne un splitter sans bouton de repli - et inversement. Les deux sont indépendants.
- **Enfant invisible = contrainte manquante** : `flex` sans `align: 'stretch'`, ou parent sans hauteur déterminée. Cf. extension E2.
- **`handler: 'onApropos'` (chaîne)** se résout sur le **ViewController** - c'est du Module 3. Ici, rester sur une **fonction** inline.
- **`requires` pour E3** : sans la déclaration, `VIGIE.domain.Equipement` est « not defined » au clic.
- **`bodyPadding` vs `padding`** : `bodyPadding` s'applique au corps d'un panel ; `padding` à un composant ou à un item de toolbar.

---

## Livrable

Un shell VIGIE fonctionnel :
- `app/view/main/Main.js` - layout `border` (barre nord, « Sites » repliable à l'ouest, contenu central en `fit`) ;
- fenêtre modale « À propos » déclenchée depuis la barre d'outils ;
- *(extension)* layout imbriqué hbox/vbox, événement métier `equipementchoisi`.

> **Checkpoint atteint** : le shell s'affiche, le panneau ouest se replie/redimensionne, la modale bloque l'arrière-plan. Dépôt de référence (état fin D2) fourni pour resynchronisation.

**Suite - Lab 3 (Architecture MVVM)** : la logique inline (handler « À propos », événement `equipementchoisi`) migrera vers un **ViewController**, et la mise à jour manuelle du contenu deviendra un **binding maître-détail** porté par un **ViewModel**.
