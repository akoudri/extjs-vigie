# Lab 4 - VIGIE sur l'API mock

> Fil rouge **VIGIE** · Associé au Module 4 (Couche données)
> Durée indicative : ~55 min (socle) · extension auto-rythmée
> **API mock retenue : json-server** (CRUD complet, requis pour l'écriture des Modules 5+).

---

## Contexte

Jusqu'ici, VIGIE manipule des objets fabriqués à la main. Ce lab installe une **vraie couche données** : l'équipement devient un `Ext.data.Model`, alimenté depuis une API REST mock par un **proxy**, exposé via un **store**, et consommé par un premier **maître-détail grille → détail**.

À l'issue, le binding du panneau de détail lit directement `{equipementCourant.nom}` - les formulas de contournement du Lab 3 disparaissent, parce que l'équipement est désormais un Model.

> Note de continuité : le **binding de sélection** de la grille remplace, pour ce maître-détail, le relais d'événement `equipementchoisi` du Module 3. Ce dernier resservira pour l'**arbre des sites** au Module 6.

---

## Prérequis

- **Lab 3 livré** : VIGIE en MVVM (`MainController`, `MainModel`), maître-détail par formulas.
- **Module 4 vu** : Models, fields, validations, associations, proxies, stores, Promises.
- **Node** disponible (pour json-server).

```bash
cd vigie
sencha app watch     # http://localhost:1841
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Lancer l'API mock (json-server)

À la racine du projet, créer `mock/db.json` :

```json
{
  "sites":      [ { "id": 1, "nom": "Usine Nord", "region": "Hauts-de-France" } ],
  "zones":      [ { "id": 1, "siteId": 1, "nom": "Atelier A" } ],
  "equipements": [
    { "id": 1, "zoneId": 1, "nom": "Pompe P-12", "etat": "OK",     "dateInstall": "2021-03-12" },
    { "id": 2, "zoneId": 1, "nom": "Vanne V-3",  "etat": "DEFAUT", "dateInstall": "2019-09-01" }
  ],
  "alarmes": [
    { "id": 1, "equipementId": 2, "severite": "haute", "message": "Pression basse", "acquittee": false }
  ]
}
```

Démarrer le serveur (port 3000) :

```bash
npx json-server@0.17.4 --watch mock/db.json --port 3000
# json-server v1+ : npx json-server mock/db.json --port 3000
```

Vérifier dans le navigateur : `http://localhost:3000/equipements` renvoie un **tableau** de deux équipements. json-server gère **CORS** : l'app servie sur `:1841` peut l'interroger.

- [ ] `GET /equipements` renvoie le tableau attendu.
- [ ] `GET /equipements/2` renvoie l'enregistrement « Vanne V-3 ».

### Étape 2 - Définir le Model `Equipement`

Créer `app/model/Equipement.js`. Ce Model **remplace** la classe à config system du Lab 1.

```javascript
Ext.define('VIGIE.model.Equipement', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id',          type: 'int' },
        { name: 'zoneId',      type: 'int' },
        { name: 'nom',         type: 'string' },
        { name: 'etat',        type: 'string' },
        { name: 'dateInstall', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'enDefaut', persist: false, calculate: function (d) {
            return d.etat === 'DEFAUT';
        } }
    ],

    validators: {
        nom:  'presence',
        etat: { type: 'inclusion', list: ['OK', 'DEFAUT', 'MAINTENANCE'] }
    },

    proxy: {
        type: 'rest',
        url: 'http://localhost:3000/equipements',
        reader: { type: 'json' }   // json-server renvoie un tableau nu : pas de rootProperty
    }
});
```

- [ ] Le Model charge depuis l'API (`reader` sans `rootProperty`).
- [ ] `enDefaut` est `persist: false` : ce champ calculé n'est pas renvoyé au serveur.

### Étape 3 - Définir le store `Equipements`

Créer `app/store/Equipements.js` :

```javascript
Ext.define('VIGIE.store.Equipements', {
    extend: 'Ext.data.Store',
    alias: 'store.equipements',
    model: 'VIGIE.model.Equipement',
    autoLoad: true,
    sorters: [{ property: 'nom', direction: 'ASC' }]
});
```

- [ ] Le store se charge automatiquement et contient les équipements de l'API.

### Étape 4 - Maître-détail : grille → détail par binding

Dans `MainModel.js`, **remplacer** les formulas du Lab 3 par l'état réel :

```javascript
data: {
    equipementCourant: null
},
stores: {
    equipements: { type: 'equipements' }
}
// (supprimer nomCourant / etatCourant : binding direct désormais possible)
```

Dans `Main.js`, placer une grille (maître) et lier sa sélection au ViewModel ; le détail lit l'enregistrement courant :

```javascript
{
    region: 'west',
    xtype: 'grid',
    title: 'Équipements',
    width: 280,
    split: true,
    bind: {
        store: '{equipements}',
        selection: '{equipementCourant}'   // sélection ↔ ViewModel
    },
    columns: [
        { text: 'Nom',  dataIndex: 'nom',  flex: 1 },
        { text: 'État', dataIndex: 'etat', width: 100 }
    ]
}
```

```javascript
{
    region: 'center',
    xtype: 'panel',
    title: 'Détail équipement',
    bodyPadding: 12,
    layout: { type: 'vbox', align: 'stretch' },
    defaultType: 'displayfield',
    items: [
        { fieldLabel: 'Nom',  bind: '{equipementCourant.nom}' },
        { fieldLabel: 'État', bind: '{equipementCourant.etat}' }
    ]
}
```

- [ ] La grille affiche les équipements chargés depuis l'API.
- [ ] Sélectionner une ligne met à jour le détail via `{equipementCourant.nom}` (binding direct).
- [ ] Les formulas `nomCourant` / `etatCourant` du Lab 3 ont été supprimées.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Associations Équipement → Alarmes

Créer `app/model/Alarme.js` avec une clé étrangère déclarant le lien :

```javascript
Ext.define('VIGIE.model.Alarme', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'equipementId', reference: 'Equipement' },
        { name: 'severite', type: 'string' },
        { name: 'message',  type: 'string' },
        { name: 'acquittee', type: 'boolean' }
    ],
    proxy: { type: 'rest', url: 'http://localhost:3000/alarmes',
             reader: { type: 'json' } }
});
```

Le `reference` génère `equipement.alarmes()`. Afficher le **nombre d'alarmes** de l'équipement courant (par exemple dans le titre du détail).

### E2 - Un chained store « alarmes actives »

Créer un store des alarmes, puis un **chained store** filtré sur les non acquittées :

```javascript
Ext.define('VIGIE.store.AlarmesActives', {
    extend: 'Ext.data.ChainedStore',
    alias: 'store.alarmesactives',
    source: 'alarmes',
    filters: [{ property: 'acquittee', value: false }]
});
```

Le brancher sur une petite grille ou afficher son `getCount()`. Vérifier qu'il reflète la source sans la recharger.

### E3 - Chargement par Promise & gestion d'échec

Charger un équipement par Promise et gérer proprement l'échec :

```javascript
Ext.Ajax.request({ url: 'http://localhost:3000/equipements/2' })
    .then(function (response) {
        var eq = Ext.decode(response.responseText);
        console.log('chargé', eq.nom);
    })
    .catch(function () {
        Ext.Msg.alert('Erreur', 'Équipement indisponible.');
    });
```

**Arrêter json-server** puis rejouer : le `catch` doit se déclencher et l'alerte s'afficher.

---

## Pièges & indices

- **Tableau nu de json-server** : les endpoints liste renvoient `[ … ]`. Un `reader` avec `rootProperty: 'data'` ne trouverait rien → laisser le `rootProperty` par défaut.
- **Champ calculé persistant** : sans `persist: false`, `enDefaut` serait renvoyé au serveur à chaque écriture (Modules 5+). Toujours marquer les champs dérivés non persistants.
- **Convention REST** : le proxy `rest` ajoute l'`id` pour lire/écrire/supprimer (`/equipements/:id`) - cohérent avec json-server.
- **Port du proxy** : l'URL du proxy doit pointer le port de json-server (3000 ici). Une erreur réseau silencieuse vient souvent d'un port erroné.
- **`equipementCourant` est maintenant un Model** : `{equipementCourant.nom}` se résout via les fields - d'où la suppression des formulas du Lab 3.
- **Binding de sélection bidirectionnel** : `selection: '{equipementCourant}'` lie la ligne sélectionnée au ViewModel ; aucun code de contrôleur nécessaire.
- **Association = Model référencé défini** : `equipement.alarmes()` n'existe que si `VIGIE.model.Alarme` (avec son `reference`) est chargé.

---

## Livrable

VIGIE alimentée par une API réelle :
- `mock/db.json` + json-server (port 3000) ;
- `app/model/Equipement.js` - Model, validations, proxy `rest` ;
- `app/store/Equipements.js` - store autoLoad ;
- maître-détail **grille → détail** par binding direct ;
- *(extension)* `app/model/Alarme.js` + associations, chained store, chargement Promise.

> **Checkpoint atteint** : `Equipement` est un `Ext.data.Model` branché sur le mock, le store alimente VIGIE, le maître-détail lit des données réelles, le binding direct remplace les formulas. Dépôt de référence (état fin D4, **mock inclus**) fourni pour resynchronisation.

**Suite - Lab 5 (Grilles)** : la grille brute de ce lab devient le **journal d'alarmes** de VIGIE - édition et acquittement (écriture via le proxy `rest`), groupes repliables, export, et performance sur gros volume (buffered rendering).
