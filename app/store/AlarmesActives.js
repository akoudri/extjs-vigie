/**
 * Lab 4 - Extension E2 : chained store « alarmes actives ».
 *
 * Vue filtrée (non acquittées) du store source `alarmes`, SANS le recharger :
 * le ChainedStore partage les enregistrements de sa source et n'applique que
 * ses propres filtres. Modifier/recharger la source se reflète ici tout seul.
 */
Ext.define('VIGIE.store.AlarmesActives', {
    extend: 'Ext.data.ChainedStore',
    alias: 'store.alarmesactives',
    source: 'alarmes',
    filters: [{ property: 'acquittee', value: false }]
});
