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
- B) undefined
- C) 1
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
- B) undefined
- C) 0
- D) 3

**Q4.** Quel appel transforme `[1, 2, 3]` en `[2, 4, 6]` ?
- A) `arr.map(x => x * 2)`
- B) `arr.filter(x => x * 2)`
- C) `arr.forEach(x => x * 2)`
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
- A) `42`
- B) `Promise`
- C) `undefined`
- D) rien

**Q7.** `import { Store } from './store.js';` suppose que `store.js` contient :
- A) `export default Store`
- B) `module.exports = Store`
- C) `window.Store = Store`
- D) `export { Store }` (ou `export const Store`)

**Q8.** Quelle affirmation sur les classes ES6 est exacte ?
- A) Elles remplacent le système de prototypes
- B) Elles sont du sucre syntaxique au-dessus des prototypes
- C) Elles autorisent l'héritage multiple natif
- D) Leurs méthodes sont copiées sur chaque instance

**Q9.** `JSON.parse('{"valeur": 42}')` renvoie :
- A) la chaîne `'{"valeur": 42}'`
- B) `42`
- C) un objet `{ valeur: 42 }`
- D) une erreur

**Q10.** Une requête `fetch('/api/x')` renvoie :
- A) une Promise résolue avec une `Response`
- B) directement les données
- C) un objet synchrone
- D) le code HTTP sous forme de nombre

---

## Palier 3 - Profil avancé (détection)

**Q11.** Dans le motif MVVM, le **ViewModel** porte principalement :
- A) le rendu des composants
- B) les appels réseau bas niveau
- C) les feuilles de style
- D) l'état observable et les données dérivées

**Q12.** En ExtJS, déclarer une propriété dans le bloc `config` d'une classe :
- A) la rend privée
- B) n'a d'effet qu'au rendu
- C) génère automatiquement un getter et un setter
- D) interdit toute modification

**Q13.** Le **databinding** déclaratif sert avant tout à :
- A) accélérer les requêtes serveur
- B) synchroniser automatiquement l'UI et un état
- C) compiler le CSS
- D) router les URL

**Q14.** Dans une chaîne de build front moderne, `tree shaking` désigne :
- A) l'élimination du code non atteint du bundle final
- B) le tri des dépendances par ordre alphabétique
- C) la minification des images
- D) la mise en cache navigateur

**Q15.** En ExtJS (toute version), un **store** est :
- A) une feuille de style globale
- B) un conteneur de mise en page
- C) un gestionnaire de routes
- D) une collection d'enregistrements typés, alimentée par un proxy

