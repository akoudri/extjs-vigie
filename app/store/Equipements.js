/**
 * Lab 4 - Store des équipements (chargé automatiquement depuis l'API mock).
 */
Ext.define('VIGIE.store.Equipements', {
    extend: 'Ext.data.Store',
    alias: 'store.equipements',
    model: 'VIGIE.model.Equipement',
    autoLoad: true,
    sorters: [{ property: 'nom', direction: 'ASC' }]
});
