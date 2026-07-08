/**
 * Lab 6 - Mesure de télémétrie (point d'une série temporelle).
 */
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
