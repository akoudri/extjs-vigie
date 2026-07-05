# Lab 6 - Dashboard de VIGIE

> Fil rouge **VIGIE** · Associé au Module 6 (Arbres, formulaires & charts)
> Durée indicative : ~60 min (socle) · extension auto-rythmée

---

## Contexte

Toutes les briques de VIGIE existent : données, journal d'alarmes, maître-détail. Ce lab les **assemble en un dashboard** piloté par la sélection : un arbre Site → Zone → Équipement, un fil d'Ariane, le journal filtré, et un chart de télémétrie.

À l'issue, choisir un équipement dans l'arbre filtre le journal sur ses alarmes et trace sa télémétrie - la console de supervision est complète.

> Note de continuité : la sélection dans l'arbre réutilise le **pivot de sélection** posé dès le Module 2 (`equipementchoisi`) et le maître-détail du Module 3. C'est le même mécanisme, à l'échelle du dashboard.

---

## Prérequis

- **Lab 5 livré** : journal d'alarmes opérationnel (`journal-alarmes`), json-server (port 3000).
- **Module 6 vu** : TreeStore, fil d'Ariane, formulaires liés, charts.
- **Package charts** : l'xtype `cartesian` provient du package `charts` (sencha-charts). L'ajouter à `app.json` s'il n'est pas déjà requis (voir Pièges).

```bash
cd vigie
sencha app watch
npx json-server@0.17.4 --watch mock/db.json --port 3000
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Enrichir le mock & définir les stores

Ajouter à `mock/db.json` une **arborescence imbriquée** (les nœuds portent les champs de pilotage) et un jeu de **mesures** :

```json
"arborescence": [
  { "text": "Usine Nord", "type": "site", "site": "Usine Nord", "expanded": true, "children": [
    { "text": "Atelier A", "type": "zone", "expanded": true, "children": [
      { "text": "Pompe P-12", "type": "equipement", "equipementId": 1, "site": "Usine Nord", "leaf": true },
      { "text": "Vanne V-3",  "type": "equipement", "equipementId": 2, "site": "Usine Nord", "leaf": true }
    ]}
  ]},
  { "text": "Usine Sud", "type": "site", "site": "Usine Sud", "expanded": true, "children": [
    { "text": "Atelier B", "type": "zone", "expanded": true, "children": [
      { "text": "Moteur M-7", "type": "equipement", "equipementId": 3, "site": "Usine Sud", "leaf": true }
    ]}
  ]}
],
"mesures": [
  { "id": 1, "equipementId": 1, "horodatage": "2024-06-01T08:00:00", "valeur": 42 },
  { "id": 2, "equipementId": 1, "horodatage": "2024-06-01T08:05:00", "valeur": 47 },
  { "id": 3, "equipementId": 1, "horodatage": "2024-06-01T08:10:00", "valeur": 51 },
  { "id": 4, "equipementId": 2, "horodatage": "2024-06-01T08:00:00", "valeur": 88 },
  { "id": 5, "equipementId": 2, "horodatage": "2024-06-01T08:05:00", "valeur": 91 }
]
```

Créer le TreeStore et le store de mesures :

```javascript
Ext.define('VIGIE.store.Arborescence', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.arborescence',
    proxy: { type: 'ajax', url: 'http://localhost:3000/arborescence' },
    root: { text: 'Parc', expanded: true }
});

Ext.define('VIGIE.model.Mesure', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'equipementId', type: 'int' },
        { name: 'horodatage', type: 'date', dateFormat: 'c' },
        { name: 'valeur', type: 'number' }
    ],
    proxy: { type: 'rest', url: 'http://localhost:3000/mesures', reader: { type: 'json' } }
});

Ext.define('VIGIE.store.Mesures', {
    extend: 'Ext.data.Store',
    alias: 'store.mesures',
    model: 'VIGIE.model.Mesure'
});
```

Dans `MainModel.js`, instancier l'arborescence **une seule fois** pour la partager entre l'arbre et le fil d'Ariane :

```javascript
stores: {
    arbo: { type: 'arborescence' }
}
```

- [ ] `GET /arborescence` renvoie l'arbre imbriqué ; `GET /mesures` renvoie les mesures.

### Étape 2 - L'arbre des sites & le fil d'Ariane

Restructurer `Main.js` : l'arbre remplace l'ancienne grille d'équipements à l'ouest ; le fil d'Ariane occupe le nord. Les deux **partagent le même TreeStore** (`{arbo}`).

```javascript
{
    region: 'north', xtype: 'breadcrumb',
    reference: 'ariane', bind: { store: '{arbo}' }
},
{
    region: 'west', xtype: 'treepanel', reference: 'arbre',
    title: 'Sites', width: 280, split: true, rootVisible: false,
    bind: { store: '{arbo}' },
    listeners: { select: 'onNodeSelect' }
}
```

- [ ] L'arbre affiche Site → Zone → Équipement ; le fil d'Ariane montre le chemin courant.

### Étape 3 - Le chart de télémétrie & le journal

La région centrale empile le chart (haut) et le journal d'alarmes (bas, extensible) :

```javascript
{
    region: 'center', xtype: 'panel',
    layout: { type: 'vbox', align: 'stretch' },
    items: [
        {
            xtype: 'cartesian', reference: 'chart', title: 'Télémétrie',
            height: 220, store: { type: 'mesures' },
            axes: [
                { type: 'numeric', position: 'left',   title: 'Valeur' },
                { type: 'time',    position: 'bottom', title: 'Temps', dateFormat: 'H:i' }
            ],
            series: [{ type: 'line', xField: 'horodatage', yField: 'valeur', marker: true }]
        },
        { xtype: 'journal-alarmes', reference: 'journal', flex: 1 }
    ]
}
```

- [ ] Le chart et le journal s'affichent l'un au-dessus de l'autre dans la région centrale.

### Étape 4 - Câbler la sélection

Dans `MainController.js`, traduire la sélection d'un nœud en filtrage du journal, chargement du chart et mise à jour du fil d'Ariane :

```javascript
onNodeSelect: function (tree, node) {
    var alarmes = this.lookup('journal').getStore(),
        mesures = this.lookup('chart').getStore();

    this.lookup('ariane').setSelection(node);   // synchronise le fil d'Ariane
    alarmes.clearFilter();

    if (node.get('type') === 'equipement') {
        var id = node.get('equipementId');
        alarmes.filter('equipementId', id);
        mesures.getProxy().setExtraParam('equipementId', id);
        mesures.load();
    } else if (node.get('type') === 'site') {
        alarmes.filter('site', node.get('site'));
        mesures.removeAll();
    }
}
```

- [ ] Sélectionner un **équipement** filtre le journal sur ses alarmes et trace sa télémétrie.
- [ ] Sélectionner un **site** filtre le journal sur ce site ; le chart se vide (pas de télémétrie agrégée).
- [ ] Le fil d'Ariane suit la sélection de l'arbre.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Réorganiser l'arbre par glisser-déposer

Activer le drag-drop sur l'arbre :

```javascript
viewConfig: { plugins: { treeviewdragdrop: { appendOnly: false } } }
```

Déplacer un équipement d'une zone à l'autre. **Discuter** : comment persister ce déplacement (mise à jour du `zoneId` via le proxy) ? Esquisser le handler `drop` qui sauvegarde l'enregistrement déplacé.

### E2 - Formulaire de configuration lié au ViewModel

Charger l'équipement sélectionné comme **enregistrement courant**, puis l'éditer dans un formulaire lié, avec bouton conditionnel.

Dans `onNodeSelect` (branche équipement), alimenter le ViewModel :

```javascript
var rec = Ext.getStore('equipements').getById(id);   // ou VIGIE.model.Equipement.load(id, ...)
this.getViewModel().set('equipementCourant', rec);
```

Ajouter un formulaire (par exemple en région est) :

```javascript
{ xtype: 'form', title: 'Configuration', bodyPadding: 10, region: 'east', width: 260,
  items: [
    { xtype: 'textfield', fieldLabel: 'Nom', bind: '{equipementCourant.nom}', allowBlank: false },
    { xtype: 'combobox',  fieldLabel: 'État', bind: '{equipementCourant.etat}',
      store: ['OK', 'DEFAUT', 'MAINTENANCE'] }
  ],
  buttons: [
    { text: 'Enregistrer', handler: 'onEnregistrer',
      bind: { disabled: '{!equipementCourant.dirty}' } }
  ]
}
```

```javascript
onEnregistrer: function () {
    var eq = this.getViewModel().get('equipementCourant');
    if (eq && eq.isValid()) eq.save();
}
```

Le bouton ne s'active que si l'enregistrement est modifié (`dirty`) ; il pousse les changements via le proxy `rest` du Module 4.

### E3 - Rafraîchissement du chart (graduée)

Simuler une télémétrie vivante : un `Ext.interval` qui ajoute une mesure au store du chart toutes les 2 s. Vérifier que le tracé se met à jour sans recharger. Discuter le coût (cf. encart « quand binder » du Module 3).

---

## Pièges & indices

- **Champ d'affichage de l'arbre** : un nœud doit porter `text` (displayField par défaut). Le proxy lit le tableau renvoyé comme enfants de la racine.
- **TreeStore partagé** : pour synchroniser arbre et fil d'Ariane, ils doivent pointer la **même instance** (d'où le store `{arbo}` du ViewModel) - pas deux `{ type: 'arborescence' }` distincts.
- **Événement de sélection** : un `treepanel` émet `select` (record). Ne pas confondre avec `itemclick`.
- **Filtre cumulatif** : toujours `clearFilter()` avant un nouveau `filter()`, sinon les filtres s'additionnent.
- **Mesures filtrées** : `setExtraParam('equipementId', id)` ajoute `?equipementId=…` ; json-server filtre par cette query.
- **Package charts manquant** : si `cartesian` est inconnu, ajouter `charts` aux `requires` d'`app.json`, puis relancer `sencha app watch`.
- **Axe temporel** : l'axe `time` exige des dates réelles → `horodatage` en `dateFormat: 'c'` dans le Model.
- **Chart vide sur un site** : c'est volontaire ; `removeAll()` matérialise l'absence de télémétrie agrégée.

---

## Livrable

Le dashboard de VIGIE :
- `mock/db.json` enrichi (arborescence, mesures) ;
- `app/store/Arborescence.js`, `app/model/Mesure.js`, `app/store/Mesures.js` ;
- `Main.js` - arbre (ouest), fil d'Ariane (nord), chart + journal (centre) ;
- `MainController.js` - `onNodeSelect` filtrant journal et chart, synchronisant le fil d'Ariane ;
- *(extension)* drag-drop, formulaire de configuration lié, chart vivant.

> **Checkpoint atteint** : le dashboard assemble arbre, journal filtré et chart de télémétrie ; la sélection pilote l'ensemble ; le fil d'Ariane suit. Dépôt de référence (état fin D6) fourni pour resynchronisation.

**Suite - Lab 7 (SPA & UX)** : le dashboard deviendra une **SPA routée** (deep-link vers un site/équipement), **responsive** (classic/modern, `responsiveConfig`), **thémée** (Fashion, Triton) et **internationalisée**.
