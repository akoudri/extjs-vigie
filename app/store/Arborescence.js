/**
 * Lab 6 - TreeStore du parc (Site → Zone → Équipement).
 *
 * Le proxy lit le tableau imbriqué renvoyé par json-server comme enfants de la
 * racine. Une SEULE instance est partagée (via le ViewModel) entre l'arbre et
 * le fil d'Ariane.
 */
Ext.define('VIGIE.store.Arborescence', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.arborescence',
    proxy: { type: 'ajax', url: 'http://localhost:3000/arborescence' },
    root: { text: 'Parc', expanded: true }
});

