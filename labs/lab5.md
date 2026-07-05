# Lab 5 - Journal d'alarmes

> Fil rouge **VIGIE** · Associé au Module 5 (Grilles)
> Durée indicative : ~55 min (socle) · extension auto-rythmée

---

## Contexte

La grille brute du Lab 4 affichait deux colonnes. Ce lab la transforme en **journal d'alarmes** : renderers, regroupement par site, **édition de l'acquittement écrite au serveur**, et export Excel. C'est la pièce de supervision centrale de VIGIE.

À l'issue, acquitter une alarme depuis la grille met à jour le serveur (PATCH via le proxy `rest` du Module 4), et le journal s'exporte d'un clic.

> Note de continuité : ce journal alimentera le **dashboard** au Module 6, filtré par le site sélectionné dans l'arbre.

---

## Prérequis

- **Lab 4 livré** : json-server tourne (port 3000), Model/store `Equipement` opérationnels, maître-détail par binding.
- **Module 5 vu** : renderers, sélection/édition, groupes, drag-drop, export, performance (buffered).
- **Package exporter disponible** : le plugin `gridexporter` provient du package `exporter`. S'il n'est pas déjà requis, l'ajouter (voir Pièges).

```bash
cd vigie
sencha app watch                                   # http://localhost:1841
npx json-server@0.17.4 --watch mock/db.json --port 3000
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Enrichir le mock + Model/store `Alarme`

Compléter `mock/db.json` : ajouter un second site (et son équipement) et un jeu d'alarmes portant un champ `site` (dénormalisé pour le regroupement) :

```json
"sites":  [
  { "id": 1, "nom": "Usine Nord", "region": "Hauts-de-France" },
  { "id": 2, "nom": "Usine Sud",  "region": "Occitanie" }
],
"zones":  [
  { "id": 1, "siteId": 1, "nom": "Atelier A" },
  { "id": 2, "siteId": 2, "nom": "Atelier B" }
],
"equipements": [
  { "id": 1, "zoneId": 1, "nom": "Pompe P-12", "etat": "OK",     "dateInstall": "2021-03-12" },
  { "id": 2, "zoneId": 1, "nom": "Vanne V-3",  "etat": "DEFAUT", "dateInstall": "2019-09-01" },
  { "id": 3, "zoneId": 2, "nom": "Moteur M-7", "etat": "MAINTENANCE", "dateInstall": "2022-01-20" }
],
"alarmes": [
  { "id": 1, "equipementId": 2, "site": "Usine Nord", "severite": "haute",   "message": "Pression basse",        "acquittee": false, "horodatage": "2024-06-01T08:12:00" },
  { "id": 2, "equipementId": 1, "site": "Usine Nord", "severite": "moyenne", "message": "Température élevée",     "acquittee": false, "horodatage": "2024-06-01T09:03:00" },
  { "id": 3, "equipementId": 3, "site": "Usine Sud",  "severite": "basse",   "message": "Maintenance planifiée", "acquittee": true,  "horodatage": "2024-06-01T10:20:00" },
  { "id": 4, "equipementId": 3, "site": "Usine Sud",  "severite": "haute",   "message": "Vibration anormale",    "acquittee": false, "horodatage": "2024-06-01T11:45:00" }
]
```

Créer `app/model/Alarme.js` (si l'extension D4 ne l'a pas déjà introduit). Le proxy écrit en **PATCH** pour ne pousser que le champ modifié :

```javascript
Ext.define('VIGIE.model.Alarme', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id',           type: 'int' },
        { name: 'equipementId', type: 'int' },
        { name: 'site',         type: 'string' },
        { name: 'severite',     type: 'string' },
        { name: 'message',      type: 'string' },
        { name: 'acquittee',    type: 'boolean' },
        { name: 'horodatage',   type: 'date', dateFormat: 'c' }
    ],
    proxy: {
        type: 'rest',
        url: 'http://localhost:3000/alarmes',
        reader: { type: 'json' },
        writer: { type: 'json', writeAllFields: false },
        actionMethods: { create: 'POST', read: 'GET', update: 'PATCH', destroy: 'DELETE' }
    }
});
```

Créer `app/store/Alarmes.js` :

```javascript
Ext.define('VIGIE.store.Alarmes', {
    extend: 'Ext.data.Store',
    alias: 'store.alarmes',
    model: 'VIGIE.model.Alarme',
    autoLoad: true,
    autoSync: true,                                  // pousse chaque édition au serveur
    groupField: 'site',
    sorters: [{ property: 'horodatage', direction: 'DESC' }]
});
```

- [ ] `GET /alarmes` renvoie les quatre alarmes ; le store se charge et se groupe par site.

### Étape 2 - La grille : renderer, groupes, édition, export

Créer `app/view/alarmes/Journal.js` :

```javascript
Ext.define('VIGIE.view.alarmes.Journal', {
    extend: 'Ext.grid.Panel',
    xtype: 'journal-alarmes',
    title: "Journal d'alarmes",

    store: { type: 'alarmes' },

    plugins: [
        { ptype: 'cellediting', clicksToEdit: 1 },
        'gridexporter'
    ],

    features: [{
        ftype: 'grouping',
        collapsible: true,
        groupHeaderTpl: '{name} ({rows.length})'
    }],

    tbar: [{
        text: 'Exporter (Excel)',
        handler: function (btn) {
            btn.up('grid').saveDocumentAs({
                type: 'xlsx', title: 'Alarmes', fileName: 'alarmes.xlsx'
            });
        }
    }],

    columns: [
        { text: 'Horodatage', dataIndex: 'horodatage', xtype: 'datecolumn',
          format: 'd/m/Y H:i', width: 140 },
        { text: 'Sévérité', dataIndex: 'severite', width: 110,
          renderer: function (v) {
              var c = v === 'haute' ? '#E5534B'
                    : v === 'moyenne' ? '#F2A340' : '#5B6876';
              return '<span style="color:' + c + ';font-weight:bold">' + v + '</span>';
          }
        },
        { text: 'Message', dataIndex: 'message', flex: 1 },
        { xtype: 'checkcolumn', text: 'Acquittée', dataIndex: 'acquittee', width: 100 }
    ]
});
```

Placer le journal dans la région centrale de `Main.js` :

```javascript
{ region: 'center', xtype: 'journal-alarmes' }
```

- [ ] La grille affiche les alarmes, **groupées par site**, en-têtes repliables avec décompte.
- [ ] La colonne sévérité est colorée (haute = rouge, moyenne = ambre, basse = gris).

### Étape 3 - Acquitter et persister

Cliquer la case « Acquittée » d'une alarme. Grâce à `cellediting` + `checkcolumn` et `autoSync`, la modification est écrite au serveur.

- [ ] Cocher « Acquittée » envoie un **PATCH** `/alarmes/:id` (vérifiable dans l'onglet réseau).
- [ ] Recharger la page : l'acquittement est conservé (persisté côté json-server).

### Étape 4 - Exporter

Cliquer « Exporter (Excel) » dans la barre d'outils.

- [ ] Un fichier `alarmes.xlsx` est téléchargé, reflétant le contenu de la grille.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Tenue de charge : 50 000 alarmes

Générer un gros volume en mémoire et **mesurer** l'effet du rendu bufferisé.

```javascript
var data = [];
for (var i = 0; i < 50000; i++) {
    data.push({
        id: i, site: i % 2 ? 'Usine Nord' : 'Usine Sud',
        severite: ['haute', 'moyenne', 'basse'][i % 3],
        message: 'Alarme ' + i, acquittee: false,
        horodatage: new Date()
    });
}
var t = Ext.now();
grille.getStore().loadData(data);
console.log('rendu', Ext.now() - t, 'ms');
```

Comparer avec `bufferedRenderer: false` sur la grille : noter la différence de temps de rendu et la fluidité du défilement. **Rétablir le rendu bufferisé** ensuite.

### E2 - Optimiser un renderer coûteux

Remplacer le renderer de sévérité par une version volontairement lourde (création d'objet + recalcul à chaque cellule), mesurer, puis l'optimiser : précalculer la table de couleurs hors du renderer, ou basculer sur une **classe CSS** (`getRowClass` / `cls`). Comparer les temps.

### E3 - Buffered store distant (graduée)

Brancher un `Ext.data.BufferedStore` (pageSize 100) sur json-server, qui pagine via `_page` / `_limit`. Vérifier que seules les pages visibles sont chargées au défilement - la charge réseau reste constante quel que soit le volume total.

---

## Pièges & indices

- **Groupes invisibles** : la feature `grouping` n'affiche rien sans `groupField` sur le store (ou `store.group('site')`).
- **PATCH vs PUT** : sans `actionMethods.update = 'PATCH'` + `writeAllFields: false`, le proxy enverrait un **PUT** remplaçant tout l'enregistrement (json-server écrase alors les champs non transmis).
- **`autoSync` vs `sync()`** : `autoSync: true` pousse chaque édition immédiatement ; pour grouper plusieurs modifications, préférer un `store.sync()` explicite.
- **`datecolumn`** exige une vraie date : le field `horodatage` est en `dateFormat: 'c'` (ISO) côté Model.
- **Package exporter manquant** : si `saveDocumentAs` est indéfini, ajouter le plugin au build - `requires: 'Ext.grid.plugin.Exporter'` et le package `exporter` dans `app.json` (`"requires": ["exporter"]`).
- **50 000 lignes** : le rendu bufferisé est actif par défaut ; ne le désactiver que **le temps de la mesure** (E1), puis le rétablir.
- **Renderer = chemin chaud** : appelé par cellule visible à chaque rafraîchissement. Y proscrire requêtes DOM, créations d'objet et calculs lourds.

---

## Livrable

Le journal d'alarmes de VIGIE :
- `mock/db.json` enrichi (deux sites, alarmes) ;
- `app/model/Alarme.js` - proxy `rest` en PATCH ;
- `app/store/Alarmes.js` - autoLoad, autoSync, groupé par site ;
- `app/view/alarmes/Journal.js` - renderer, groupes repliables, édition d'acquittement, export ;
- *(extension)* mesures de performance, renderer optimisé, buffered store distant.

> **Checkpoint atteint** : le journal affiche/groupe/édite l'acquittement (écriture serveur), l'export Excel fonctionne, la grille reste fluide sur gros volume. Dépôt de référence (état fin D5) fourni pour resynchronisation.

**Suite - Lab 6 (Arbres, formulaires, widgets & charts)** : l'**arbre des sites** (Site → Zone → Équipement, fil d'Ariane) filtrera ce journal, un **formulaire** de configuration sera lié au ViewModel, et des **charts** de télémétrie compléteront le **dashboard** de VIGIE.
