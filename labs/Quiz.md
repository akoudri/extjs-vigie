# VIGIE - Quiz de positionnement (J0)

> À passer **le Jour 1** · ~20 min
> Public cible : développeurs JavaScript confirmés découvrant ExtJS 6/7.

---

## Mode d'emploi (apprenant)

15 questions à choix unique, organisées en **trois paliers** de difficulté croissante. Répondre sans aide ni IDE, d'une traite. Le but n'est pas la note : il est de **calibrer** la session et de repérer ce qu'un pré-travail ciblé doit consolider.

- **Palier 1 - Fondations (plancher)** : le socle JavaScript présupposé. *À maîtriser absolument.*
- **Palier 2 - Niveau attendu** : JavaScript moderne et outillage web.
- **Palier 3 - Profil avancé** : architecture et ExtJS - pour détecter les profils déjà expérimentés.

---

## Palier 1 - Fondations (plancher)

**Q1.** Que vaut `x` ?
```javascript
let x = 1;
{ let x = 2; }
```
- A) 2
- B) 1
- C) undefined
- D) Erreur

**Q2.** Dans une fonction fléchée, `this` désigne :
- A) l'objet appelant au moment de l'appel
- B) le `this` du contexte englobant à la définition
- C) toujours `window`
- D) l'argument `this` passé explicitement

**Q3.** Que renvoie `compteur()` au troisième appel ?
```javascript
function fabrique() {
    let n = 0;
    return () => ++n;
}
const compteur = fabrique();
compteur(); compteur(); compteur();
```
- A) 1
- B) 3
- C) undefined
- D) 0

**Q4.** Quel appel transforme `[1, 2, 3]` en `[2, 4, 6]` ?
- A) `arr.filter(x => x * 2)`
- B) `arr.forEach(x => x * 2)`
- C) `arr.map(x => x * 2)`
- D) `arr.reduce(x => x * 2)`

**Q5.** Que vaut `b` ?
```javascript
const { etat: b = 'OK' } = { nom: 'P-12' };
```
- A) undefined
- B) 'P-12'
- C) 'OK'
- D) Erreur

---

## Palier 2 - Niveau attendu

**Q6.** Que journalise ce code ?
```javascript
async function f() { return 42; }
f().then(v => console.log(v));
```
- A) `Promise`
- B) `42`
- C) `undefined`
- D) rien

**Q7.** `import { Store } from './store.js';` suppose que `store.js` contient :
- A) `export default Store`
- B) `export { Store }` (ou `export const Store`)
- C) `module.exports = Store`
- D) `window.Store = Store`

**Q8.** Quelle affirmation sur les classes ES6 est exacte ?
- A) Elles remplacent le système de prototypes
- B) Elles sont du sucre syntaxique au-dessus des prototypes
- C) Elles autorisent l'héritage multiple natif
- D) Leurs méthodes sont copiées sur chaque instance

**Q9.** `JSON.parse('{"valeur": 42}')` renvoie :
- A) la chaîne `'{"valeur": 42}'`
- B) un objet `{ valeur: 42 }`
- C) `42`
- D) une erreur

**Q10.** Une requête `fetch('/api/x')` renvoie :
- A) directement les données
- B) une Promise résolue avec une `Response`
- C) un objet synchrone
- D) le code HTTP sous forme de nombre

---

## Palier 3 - Profil avancé (détection)

**Q11.** Dans le motif MVVM, le **ViewModel** porte principalement :
- A) le rendu des composants
- B) l'état observable et les données dérivées
- C) les appels réseau bas niveau
- D) les feuilles de style

**Q12.** En ExtJS, déclarer une propriété dans le bloc `config` d'une classe :
- A) génère automatiquement un getter et un setter
- B) la rend privée
- C) interdit toute modification
- D) n'a d'effet qu'au rendu

**Q13.** Le **databinding** déclaratif sert avant tout à :
- A) accélérer les requêtes serveur
- B) synchroniser automatiquement l'UI et un état
- C) compiler le CSS
- D) router les URL

**Q14.** Dans une chaîne de build front moderne, `tree shaking` désigne :
- A) le tri des dépendances par ordre alphabétique
- B) l'élimination du code non atteint du bundle final
- C) la minification des images
- D) la mise en cache navigateur

**Q15.** En ExtJS (toute version), un **store** est :
- A) une feuille de style globale
- B) une collection d'enregistrements typés, alimentée par un proxy
- C) un conteneur de mise en page
- D) un gestionnaire de routes

---

## Corrigé

| Q | Réponse | Pourquoi (bref) |
|---|---|---|
| 1 | **B** | `let` est à portée de bloc ; le `x` interne n'affecte pas l'externe. |
| 2 | **B** | La fonction fléchée capture le `this` lexical de définition. |
| 3 | **B** | La closure conserve `n` ; trois incréments → 3. |
| 4 | **C** | `map` transforme chaque élément et renvoie un nouveau tableau. |
| 5 | **C** | Clé absente → valeur par défaut `'OK'` (renommage `etat` → `b`). |
| 6 | **B** | Une fonction `async` renvoie une Promise résolue avec `42`. |
| 7 | **B** | Import nommé → export nommé correspondant. |
| 8 | **B** | Les classes ES6 sont du sucre au-dessus des prototypes. |
| 9 | **B** | `JSON.parse` produit un objet JavaScript. |
| 10 | **B** | `fetch` renvoie une Promise résolue avec une `Response`. |
| 11 | **B** | Le ViewModel = état observable + données dérivées. |
| 12 | **A** | Le config system génère getter/setter (et apply/update). |
| 13 | **B** | Le binding synchronise UI ↔ état automatiquement. |
| 14 | **B** | Le tree shaking retire le code mort du bundle. |
| 15 | **B** | Un store est une collection d'enregistrements via un proxy. |

---

## Grille d'interprétation (formateur)

> **Règle d'or : le plancher prime sur le score total.** Un score global élevé porté par les paliers 2–3 ne compense pas un palier 1 fragile.

**Palier 1 (Q1–Q5) - plancher.**
- **5/5** : prérequis JavaScript acquis → prêt pour le pré-travail puis J1.
- **3–4/5** : lacunes ciblées → le pré-travail (modules 1–2) doit être complété sérieusement.
- **≤ 2/5** : prérequis non atteints → ce participant n'est pas prêt pour une session « confirmés ». Signaler en amont.

**Palier 2 (Q6–Q10) - niveau attendu.**
- Mesure l'aisance avec le JavaScript moderne et l'outillage. Un score faible ici (avec plancher acquis) se rattrape par le pré-travail.

**Palier 3 (Q11–Q15) - profil avancé.**
- **Ne conditionne pas l'admission.** Sert à **détecter les profils expérimentés**, notamment d'anciens praticiens ExtJS (4/5) qui répondront juste à Q12 et Q15.

### Détection de bimodalité → deux sessions

Croiser le **palier 3** sur l'ensemble du groupe :

- Si une **fraction nette** du groupe score haut au palier 3 (≥ 4/5, en particulier Q12 et Q15 justes) **tandis qu'une autre fraction y score ~0**, le groupe est **bimodal** : des vétérans ExtJS 4/5 côtoient des néophytes complets.
- Dans ce cas, **recommander deux sessions** (ou, a minima, le dédoublement socle/extension agressif + J0 obligatoire). Une session unique nivellerait par le bas ou perdrait les débutants.
- Si le palier 3 est **uniformément bas** (population homogène « JS confirmé / ExtJS néophyte »), l'hypothèse de calibrage (a) tient : session unique, J1 en montée en charge sur le paradigme Ext.

> Synthèse à produire après dépouillement : distribution des scores par palier + signalement explicite des participants sous le plancher et de toute bimodalité détectée.
