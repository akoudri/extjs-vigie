# Lab 3 - Refactor MVVM & maître-détail

> Fil rouge **VIGIE** · Associé au Module 3 (Architecture MVVM)
> Durée indicative : ~55 min (socle) · extension auto-rythmée

---

## Contexte

Le shell du Lab 2 fonctionne, mais sa logique vit en **fonctions inline** dans la vue : le handler « À propos » et la mise à jour manuelle du contenu. Ce lab extrait cette logique vers un **ViewController**, introduit un **ViewModel** porteur de l'état, et établit le premier **maître-détail** de VIGIE par databinding.

À l'issue, sélectionner un équipement met à jour un panneau de détail **sans aucune ligne de synchronisation** : c'est le binding qui s'en charge.

> Note de continuité : l'équipement reste une classe à **config system** (Lab 1). Le binding à chemin direct `{equipementCourant.nom}` ne traverse pas un getter de config ; on passe donc par une **formula**. Au **Module 4**, `Equipement` deviendra un `Ext.data.Model` et le binding direct remplacera ces formulas. Cette friction motive précisément la couche données.

---

## Prérequis

- **Lab 2 livré** : shell `border` opérationnel (`app/view/main/Main.js`), barre d'outils, panneau « Sites » repliable.
- **Module 3 vu** : V/VC/VM, `reference`/`lookup`, `bind`, formulas, binding bidirectionnel.
- Les fichiers `MainController.js` et `MainModel.js` **générés par Sencha Cmd** existent déjà (alias `controller.main` / `viewmodel.main`). Ce lab les **garnit** - ne pas créer de doublons.

```bash
cd vigie
sencha app watch     # http://localhost:1841
```

---

## SOCLE - pour tous

Contrat minimal atteint par l'ensemble du groupe.

### Étape 1 - Déplacer le handler « À propos » vers le ViewController

Dans `Main.js`, remplacer la fonction inline du bouton par une **référence de méthode** (chaîne) et une `reference` :

```javascript
{ text: 'À propos', reference: 'btnApropos', handler: 'onApropos' }
```

Dans `app/view/main/MainController.js`, ajouter la méthode :

```javascript
Ext.define('VIGIE.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires: ['VIGIE.domain.Equipement'],

    onApropos: function () {
        Ext.create('Ext.window.Window', {
            title: 'À propos de VIGIE',
            modal: true,
            width: 360, height: 200,
            layout: 'fit',
            items: [{ xtype: 'component', padding: 16,
                html: 'VIGIE - console de supervision.<br>Édition de formation.' }]
        }).show();
    }
});
```

- [ ] Le bouton « À propos » ouvre toujours la fenêtre modale.
- [ ] Plus aucune fonction inline ne subsiste pour ce handler dans la vue.

### Étape 2 - Déclarer l'état dans le ViewModel

Dans `app/view/main/MainModel.js`, déclarer l'équipement courant et deux formulas d'affichage :

```javascript
Ext.define('VIGIE.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        equipementCourant: null
    },

    formulas: {
        nomCourant:  function (get) { var e = get('equipementCourant'); return e ? e.getNom()  : '—'; },
        etatCourant: function (get) { var e = get('equipementCourant'); return e ? e.getEtat() : '—'; }
    }
});
```

- [ ] `MainModel` expose `equipementCourant` et les formulas `nomCourant` / `etatCourant`.

### Étape 3 - Lier un panneau de détail

Remplacer le contenu de la région `center` de `Main.js` par un panneau de détail dont les champs sont **liés** au ViewModel :

```javascript
{
    region: 'center',
    xtype: 'panel',
    title: 'Détail équipement',
    bodyPadding: 12,
    layout: { type: 'vbox', align: 'stretch' },
    defaultType: 'displayfield',
    items: [
        { fieldLabel: 'Nom',  bind: '{nomCourant}' },
        { fieldLabel: 'État', bind: '{etatCourant}' }
    ]
}
```

- [ ] Le panneau de détail affiche « - » tant qu'aucun équipement n'est sélectionné.

### Étape 4 - Relayer la sélection : événement → VC → VM

La source de sélection (l'arbre viendra au Module 6) est simulée par deux boutons dans la barre d'outils. Ils publient l'événement métier ; le ViewController le traduit en mise à jour du ViewModel.

Dans la barre d'outils de `Main.js` :

```javascript
{ text: 'P-12 (OK)',     handler: 'onChoisir', eqNom: 'Pompe P-12', eqEtat: 'OK' },
{ text: 'V-3 (DÉFAUT)',  handler: 'onChoisir', eqNom: 'Vanne V-3',  eqEtat: 'DEFAUT' }
```

Sur la vue `Main`, écouter l'événement :

```javascript
listeners: { equipementchoisi: 'onEquipementChoisi' }
```

Dans le `MainController` :

```javascript
onChoisir: function (btn) {
    var eq = Ext.create('VIGIE.domain.Equipement', { nom: btn.eqNom, etat: btn.eqEtat });
    this.getView().fireEvent('equipementchoisi', this.getView(), eq);
},

onEquipementChoisi: function (src, eq) {
    this.getViewModel().set('equipementCourant', eq);
}
```

- [ ] Cliquer « P-12 » puis « V-3 » change le détail affiché **sans code de synchronisation**.
- [ ] Le chemin est bien `événement → ViewController → ViewModel → binding`.

---

## EXTENSION - pour aller plus loin

Pistes graduées pour les plus rapides. **Jamais évaluées, jamais « dues ».**

### E1 - Une formula pour la visibilité

Ajouter au `MainModel` une formula `enDefaut`, puis afficher conditionnellement un bandeau d'alerte :

```javascript
// MainModel.formulas
enDefaut: function (get) {
    var e = get('equipementCourant');
    return !!e && e.getEtat() === 'DEFAUT';
}
```

```javascript
// Main.js - dans le panneau de détail
{ xtype: 'component', padding: '8 0 0 0',
  html: '<b style="color:#E5534B">Équipement en défaut</b>',
  bind: { hidden: '{!enDefaut}' } }
```

Vérifier que le bandeau n'apparaît que pour « V-3 (DÉFAUT) ».

### E2 - Un champ en binding bidirectionnel

Ajouter `seuil: 80` aux `data` du ViewModel, puis un champ éditable **et** un reflet en lecture seule, tous deux liés à `{seuil}` :

```javascript
{ xtype: 'numberfield',  fieldLabel: 'Seuil',        bind: '{seuil}' },
{ xtype: 'displayfield', fieldLabel: 'Seuil (écho)', bind: '{seuil}' }
```

Modifier le champ : l'écho se met à jour. Le ViewModel est bien la source unique.

### E3 - Mesurer le coût d'une formula (graduée)

Illustrer l'encart « quand binder » du Module 3. Ajouter une valeur à **haute fréquence** au ViewModel (télémétrie simulée) et une formula qui en dépend :

```javascript
// dans onEquipementChoisi ou au démarrage du contrôleur
var vm = this.getViewModel();
Ext.interval(function () { vm.set('mesure', Math.random() * 100); }, 200);
```

```javascript
// MainModel.formulas
mesureFormatee: function (get) { return get('mesure').toFixed(1) + ' °C'; }
```

Observer (console ou compteur) la fréquence de recalcul. Discuter : à partir de quelle fréquence/coût vaut-il mieux une mise à jour impérative ciblée plutôt qu'un binding ?

---

## Pièges & indices

- **Chemin direct vs config system** : `{equipementCourant.nom}` ne traverse pas le getter de config → rendu vide. D'où les formulas. Au Module 4, `Equipement` devient un `Ext.data.Model` et `{equipementCourant.nom}` fonctionnera directement.
- **Éditer, pas dupliquer** : `MainController`/`MainModel` existent déjà (générés). Vérifier l'`alias` (`controller.main` / `viewmodel.main`) plutôt que d'en recréer.
- **`handler: 'onApropos'` (chaîne)** ne se résout que si la méthode existe sur le ViewController attaché à la vue.
- **`reference` + `lookup('btnApropos')`** remplacent `down('#id')` : préférer le référencement déclaratif.
- **`getViewModel()`** retourne le ViewModel le plus proche dans la hiérarchie de la vue - vérifier qu'on vise le bon.
- **`displayfield` est en lecture seule** ; pour le binding bidirectionnel (E2), utiliser un champ de saisie (`textfield`, `numberfield`).
- **Formula = donnée dérivée, pas effet de bord** : ne pas y placer de logique qui modifie l'état (risque de boucle).

---

## Livrable

VIGIE en architecture MVVM :
- `Main.js` - vue **déclarative** (plus de logique inline) ;
- `MainController.js` - handlers et relais d'événement ;
- `MainModel.js` - `equipementCourant`, formulas d'affichage ;
- maître-détail fonctionnel par binding ;
- *(extension)* formula de visibilité, binding bidirectionnel, mesure de churn.

> **Checkpoint atteint** : vue déclarative, ViewController et ViewModel en place, sélection → détail par binding, zéro handler inline. Dépôt de référence (état fin D3) fourni pour resynchronisation.

**Suite - Lab 4 (Couche données)** : `Equipement` devient un véritable `Ext.data.Model` (fields, validations, associations), branché sur une **API mock** via proxy et store. Les données en dur et les formulas d'affichage cèdent la place au binding direct `{equipementCourant.nom}`.
