/**
 * Lab 5 - Store des alarmes.
 *
 * `autoSync: true` pousse chaque édition au serveur immédiatement (PATCH).
 * Regroupé par site (`groupField`) pour la feature `grouping` de la grille.
 *
 * `storeId: 'alarmes'` (hérité du Lab 4 E2) reste indispensable : instancié
 * une seule fois au démarrage (Application.stores), ce store global est la
 * source du ChainedStore `AlarmesActives` ET celui du journal - le retirer
 * casse la résolution `source: 'alarmes'` au lancement.
 */
Ext.define('VIGIE.store.Alarmes', {
    extend: 'Ext.data.Store',
    alias: 'store.alarmes',
    storeId: 'alarmes',
    model: 'VIGIE.model.Alarme',
    autoLoad: true,
    autoSync: true,
    groupField: 'site',
    sorters: [{ property: 'horodatage', direction: 'DESC' }]
});
