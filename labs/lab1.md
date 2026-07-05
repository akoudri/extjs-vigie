# Lab 1 - Bootstrap de VIGIE

> Fil rouge **VIGIE** · Associé au Module 1 (Socle & système de classes)
> Durée indicative : ~50 min (socle) · extension auto-rythmée

---

## Contexte

Ce lab pose la **première pierre** de VIGIE, la console de supervision qui grandira au fil de la formation. À ce stade, l'objectif n'est pas l'interface : c'est de disposer d'un projet qui démarre proprement et de manipuler le **système de classes** d'ExtJS sur de premiers artefacts métier.

Deux classes sont créées :
- `VIGIE.domain.Equipement` - l'équipement supervisé, première classe métier ;
- `VIGIE.util.SeuilTelemetrie` - un petit utilitaire qui exerce le **config system** (`apply`/`update`).

> Note de continuité : l'équipement est ici une classe ordinaire. Plus tard, il migrera vers un véritable `Ext.data.Model` avec proxy et store. La cible architecturale émerge progressivement ; rien n'est imposé d'un bloc.

---

## Prérequis

- **Quizz validé** : Node, **Sencha Cmd** installé (`sencha which`), IDE configuré, plancher JavaScript acquis.
- **Module 1 vu** : `Ext.define` / `Ext.create`, config system, héritage, mixins, chargement par dépendances.
- Aucun livrable de lab antérieur (premier lab du fil rouge).

Vérification rapide :

```bash
sencha which          # affiche la version de Sencha Cmd
node -v
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Générer et démarrer l'application

Générer le squelette, puis lancer le serveur de développement.

```bash
sencha generate app -ext VIGIE ./vigie
cd vigie
sencha app watch
# Application servie sur http://localhost:1841
```

Ouvrir l'URL dans le navigateur : l'application de démonstration générée doit s'afficher.

- [ ] L'application VIGIE démarre sans erreur en console.
- [ ] La page est servie sur `http://localhost:1841` et se recharge à chaque modification.

### Étape 2 - Première classe métier : `Equipement`

Créer le fichier `app/domain/Equipement.js`. **Le nom de classe doit refléter le chemin** (`VIGIE.domain.Equipement` → `app/domain/Equipement.js`).

```javascript
Ext.define('VIGIE.domain.Equipement', {
    config: {
        nom:  '',
        etat: 'inconnu'
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    },

    estEnDefaut: function () {
        return this.getEtat() === 'DEFAUT';
    }
});
```

Instancier la classe depuis la console du navigateur (ou un point d'entrée temporaire) et vérifier les accesseurs générés par le config system :

```javascript
var eq = Ext.create('VIGIE.domain.Equipement', { nom: 'Pompe P-12', etat: 'OK' });

eq.getNom();        // 'Pompe P-12'
eq.estEnDefaut();   // false
eq.setEtat('DEFAUT');
eq.estEnDefaut();   // true
```

- [ ] La classe `VIGIE.domain.Equipement` est définie et chargée (pas d'erreur « is not defined »).
- [ ] `getNom()` / `setEtat()` fonctionnent (getters/setters générés par le config system).
- [ ] `estEnDefaut()` reflète correctement l'état courant.

### Étape 3 - Exercer le config system : `SeuilTelemetrie`

Créer `app/util/SeuilTelemetrie.js`. Ce petit utilitaire **borne** une valeur de seuil et **journalise** ses changements, via `apply` et `update`.

```javascript
Ext.define('VIGIE.util.SeuilTelemetrie', {
    config: {
        seuil: 80
    },

    constructor: function (cfg) {
        this.initConfig(cfg);
    },

    applySeuil: function (v) {
        return Math.max(0, Math.min(100, v));   // borne [0, 100]
    },

    updateSeuil: function (v, old) {
        console.log('seuil', old, '->', v);
    }
});
```

Vérifier le comportement :

```javascript
var s = Ext.create('VIGIE.util.SeuilTelemetrie', { seuil: 120 });
s.getSeuil();     // 100  (borné par applySeuil)
s.setSeuil(60);   // console : seuil 100 -> 60
```

- [ ] `apply` borne effectivement la valeur (120 → 100).
- [ ] `update` est appelé à chaque changement et journalise l'ancienne et la nouvelle valeur.

### Étape 4 - Vérifier dans l'Inspector

Ouvrir **Sencha Inspector** et confirmer que les classes définies apparaissent, et que les instances créées sont inspectables.

- [ ] `VIGIE.domain.Equipement` et `VIGIE.util.SeuilTelemetrie` sont visibles côté framework.
- [ ] Une instance d'`Equipement` est inspectable (état des configs lisible).

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Un mixin réutilisable

Créer `app/mixin/Horodatable.js` : un comportement transverse qui horodate son porteur.

```javascript
Ext.define('VIGIE.mixin.Horodatable', {
    horodater: function () {
        this.maj = new Date();
        return this.maj;
    },
    derniereMaj: function () {
        return this.maj || null;
    }
});
```

L'appliquer à une nouvelle classe `VIGIE.domain.Alarme` :

```javascript
Ext.define('VIGIE.domain.Alarme', {
    mixins: ['VIGIE.mixin.Horodatable'],
    config: { message: '', severite: 'info' },
    constructor: function (cfg) { this.initConfig(cfg); }
});
```

Démontrer que `horodater()` est disponible sur une instance d'`Alarme` alors que la classe n'en hérite pas (composition, pas héritage).

### E2 - Un override

Appliquer un `Ext.define` avec `override` pour enrichir `VIGIE.domain.Equipement` **sans toucher au fichier d'origine** - par exemple ajouter une étiquette lisible :

```javascript
Ext.define('VIGIE.overrides.EquipementLibelle', {
    override: 'VIGIE.domain.Equipement',

    libelle: function () {
        return this.getNom() + ' [' + this.getEtat() + ']';
    }
});
```

Vérifier que toute instance d'`Equipement` dispose désormais de `libelle()`.

### E3 - Un membre statique (graduée)

Ajouter à `Equipement` une **fabrique statique** `depuisCapteur(data)` qui construit une instance à partir d'un objet brut, et l'utiliser. Discuter : pourquoi `statics` plutôt qu'une fonction libre ?

---

## Pièges & indices

- **Nom de classe ≠ chemin de fichier** → erreur de chargement silencieuse. `VIGIE.domain.Equipement` *doit* résider dans `app/domain/Equipement.js`. C'est la cause n°1 des « is not defined ».
- **Constructeur personnalisé sans `initConfig`** → les `config` ne sont pas amorcées, les getters renvoient `undefined`. Toujours appeler `this.initConfig(cfg)` quand un constructeur est défini.
- **Champs vs config** : ici on utilise le **config system** (getters/setters générés), pas les `fields` d'un `Ext.data.Model`. La couche données viendra au Module 4 - ne pas anticiper.
- **`apply` vs `update`** : `apply` *transforme et renvoie* la valeur à stocker ; `update` *réagit* après coup. Oublier le `return` dans `applyXxx` fait stocker `undefined`.
- **Override non chargé** : un override n'a d'effet que s'il est effectivement chargé (via `requires` ou la configuration de l'app). S'il « ne fait rien », vérifier son chargement avant tout.
- **`callParent`** : ne s'emploie qu'avec `extend`. Pour enchaîner sur une méthode *overridée*, c'est `callParent` également dans le contexte de l'override.

---

## Livrable

Un dépôt VIGIE qui **démarre** et contient :
- `app/domain/Equipement.js` - première classe métier (config system) ;
- `app/util/SeuilTelemetrie.js` - exercice `apply`/`update` ;
- *(extension)* `app/mixin/Horodatable.js`, `app/domain/Alarme.js`, override éventuel.

> **Checkpoint atteint** : l'application scaffoldée démarre, une classe métier exploite le config system, l'Inspector est opérationnel. Un dépôt de référence (état fin D1) est fourni pour resynchronisation.

**Suite - Lab 2 (Composants, conteneurs & layouts)** : ces classes resteront en coulisses ; le prochain lab construit le **shell applicatif** de VIGIE (viewport, régions, barre d'outils) et affronte le système de layout.
