/**
 * Lab 5 - Extension E3 : store bufferisé distant.
 *
 * Un `BufferedStore` ne garde en mémoire que les pages proches de la zone
 * visible et charge le reste à la demande au défilement : la charge réseau
 * reste constante (une page de 100) quel que soit le volume total.
 *
 * json-server pagine via `_page`/`_limit` et trie via `_sort`/`_order` :
 * on mappe les paramètres du proxy en conséquence (`startParam: ''`
 * désactive l'envoi de `start`, inutile en pagination par page). Le total,
 * lui, arrive dans l'en-tête `X-Total-Count` (reader `totalheader`).
 *
 * Démo grand volume : `./mock-large.sh 10000` sert une base générée de
 * 10 000 alarmes ; l'onglet réseau montre alors que seules les pages
 * visibles sont chargées au fil du scroll.
 */
Ext.define('VIGIE.store.AlarmesBuffered', {
    extend: 'Ext.data.BufferedStore',
    alias: 'store.alarmesbuffered',

    requires: ['VIGIE.util.TotalHeaderReader'],

    model: 'VIGIE.model.Alarme',
    autoLoad: true,
    pageSize: 100,
    remoteSort: true,
    sorters: [{ property: 'horodatage', direction: 'DESC' }],

    // Proxy propre au store : celui du Model écrit en PATCH pour le journal
    // éditable ; ici on ne fait que lire, paginé façon json-server.
    proxy: {
        type: 'rest',
        url: 'http://localhost:3000/alarmes',
        pageParam: '_page',
        limitParam: '_limit',
        startParam: '',                  // '' = ne pas envoyer ce paramètre
        sortParam: '_sort',
        directionParam: '_order',
        simpleSortMode: true,            // _sort=horodatage&_order=DESC
        reader: { type: 'totalheader' }
    }
});
