/**
 * Lab 5 - Modèle d'alarme.
 *
 * Le proxy écrit en PATCH (writeAllFields:false) pour ne pousser que le champ
 * modifié (l'acquittement) sans écraser le reste de l'enregistrement côté
 * json-server.
 */
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
