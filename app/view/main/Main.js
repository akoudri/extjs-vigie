/**
 * Shell applicatif de VIGIE — Lab D4 (couche données).
 *
 * Maître-détail réel : une grille (ouest) liée au store `{equipements}` ;
 * sa sélection alimente `{equipementCourant}` ; le détail (centre) lit
 * directement les fields du Model via binding (`{equipementCourant.nom}`).
 *
 * Le relais d'événement `equipementchoisi` (Lab D3) resservira pour l'arbre
 * des sites au Lab D6 ; ici, c'est le binding de sélection de grille qui pilote.
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    controller: 'main',
    viewModel: 'main',

    requires: [
        'VIGIE.view.alarmes.Journal',
        'VIGIE.view.alarmes.JournalBuffered'
    ],

    layout: 'border',

    listeners: {
        equipementchoisi: 'onEquipementChoisi'
    },

    items: [
        {
            region: 'north',
            xtype: 'toolbar',
            height: 48,
            items: [
                { xtype: 'component', html: '<b>VIGIE</b> — Supervision' },
                { xtype: 'tbfill' },
                { xtype: 'textfield', emptyText: 'Filtrer…', width: 200 },
                { text: 'À propos', reference: 'btnApropos', handler: 'onApropos' }
            ]
        },
        {
            region: 'west',
            xtype: 'grid',
            title: 'Équipements',
            width: 280,
            split: true,
            bind: {
                store: '{equipements}',
                selection: '{equipementCourant}'   // sélection ↔ ViewModel
            },
            columns: [
                { text: 'Nom',  dataIndex: 'nom',  flex: 1 },
                { text: 'État', dataIndex: 'etat', width: 100 }
            ]
        },
        // Lab D5 : la région centrale accueille le journal d'alarmes.
        // Extension E3 : un onglet supplémentaire montre la même donnée via
        // un BufferedStore distant (pages chargées au défilement).
        {
            region: 'center',
            xtype: 'tabpanel',
            items: [
                { xtype: 'journal-alarmes' },
                { xtype: 'journal-alarmes-buffered' }
            ]
        }
    ]
});
