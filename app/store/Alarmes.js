/**
 * Lab 4 - Extension E2 : store source des alarmes.
 *
 * `storeId: 'alarmes'` l'enregistre dans le StoreManager global : c'est ce nom
 * que le ChainedStore `AlarmesActives` résout via `source: 'alarmes'`.
 * Instancié une seule fois au démarrage (voir Application.stores).
 */
Ext.define('VIGIE.store.Alarmes', {
    extend: 'Ext.data.Store',
    alias: 'store.alarmes',
    storeId: 'alarmes',
    model: 'VIGIE.model.Alarme',
    autoLoad: true
});
