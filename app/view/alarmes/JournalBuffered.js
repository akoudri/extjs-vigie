/**
 * Lab 5 - Extension E3 : journal branché sur le BufferedStore distant.
 *
 * Grille en lecture seule (pas d'édition ni d'export ici : le sujet est le
 * scroll virtuel). Pas de regroupement non plus : la feature `grouping`
 * suppose l'ensemble des données en mémoire, ce qui est précisément ce
 * qu'un store bufferisé évite.
 *
 * À observer dans l'onglet réseau : au défilement, des GET
 * `/alarmes?_page=N&_limit=100` partent page par page - jamais la totalité.
 */
Ext.define('VIGIE.view.alarmes.JournalBuffered', {
    extend: 'Ext.grid.Panel',
    xtype: 'journal-alarmes-buffered',
    title: 'Journal (buffered store)',

    requires: [
        'VIGIE.store.AlarmesBuffered',
        'VIGIE.util.Severite'
    ],

    store: { type: 'alarmesbuffered' },

    columns: [
        { text: 'Horodatage', dataIndex: 'horodatage', xtype: 'datecolumn',
          format: 'd/m/Y H:i', width: 140 },
        { text: 'Sévérité', dataIndex: 'severite', width: 110,
          renderer: function (v, metaData) {
              return VIGIE.util.Severite.renderer(v, metaData);
          }
        },
        { text: 'Message', dataIndex: 'message', flex: 1 },
        { text: 'Site', dataIndex: 'site', width: 140 },
        { text: 'Acquittée', dataIndex: 'acquittee', width: 100,
          renderer: function (v) { return v ? 'Oui' : 'Non'; } }
    ],

    initComponent: function () {
        VIGIE.util.Severite.injecterCss();
        this.callParent();
    }
});
