/**
 * Lab 4 - Extension E1 : Model `Alarme` associé à `Equipement`.
 *
 * Le field `equipementId` porte un `reference: 'Equipement'` : c'est cette clé
 * étrangère déclarée qui génère, côté Equipement, le store d'association
 * `equipement.alarmes()`. L'association n'existe QUE si ce Model est chargé
 * (d'où le `requires` sur VIGIE.model.Alarme dans le Model Equipement).
 */
Ext.define('VIGIE.model.Alarme', {
    extend: 'VIGIE.model.Base',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'equipementId', reference: 'Equipement' },
        { name: 'severite',  type: 'string' },
        { name: 'message',   type: 'string' },
        { name: 'acquittee', type: 'boolean' }
    ],

    proxy: {
        type: 'rest',
        url: 'http://localhost:3000/alarmes',
        reader: { type: 'json' }   // tableau nu de json-server : pas de rootProperty
    }
});
