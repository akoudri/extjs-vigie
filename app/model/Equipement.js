/**
 * Lab 4 - Équipement en tant que `Ext.data.Model`.
 *
 * Remplace, pour la couche données, la classe à config system du Lab 1.
 * Alimenté depuis l'API REST mock (json-server) via un proxy `rest`.
 */
Ext.define('VIGIE.model.Equipement', {
    // E1 : Base porte le namespace du schéma (entityName court `Equipement`),
    // condition pour que le `reference: 'Equipement'` d'Alarme se résolve.
    extend: 'VIGIE.model.Base',

    // E1 : NE PAS require Alarme ici. Alarme porte `reference: 'Equipement'` ;
    // un require croisé formerait un cycle qui empêche ExtJS de greffer
    // l'association `alarmes()`. Les deux Models sont chargés au démarrage via
    // Application.models, ce qui câble l'association de façon déterministe.

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
