/**
 * Lab 6 - Store des mesures (chargé à la demande par equipementId).
 */
Ext.define('VIGIE.store.Mesures', {
    extend: 'Ext.data.Store',
    alias: 'store.mesures',
    model: 'VIGIE.model.Mesure'
});
