/**
 * Shell applicatif de VIGIE - Lab 4 (couche données).
 *
 * Maître-détail réel : une grille (ouest) liée au store `{equipements}` ;
 * sa sélection alimente `{equipementCourant}` ; le détail (centre) lit
 * directement les fields du Model via binding (`{equipementCourant.nom}`).
 *
 * Le relais d'événement `equipementchoisi` (Lab D3) resservira pour l'arbre
 * des sites au Lab 6 ; ici, c'est le binding de sélection de grille qui pilote.
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    controller: 'main',
    viewModel: 'main',

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
                // E3 : déclenche un chargement par Promise (avec catch → alerte).
                { text: 'Tester chargement', handler: 'onTesterChargement' },
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
        {
            region: 'center',
            xtype: 'panel',
            title: 'Détail équipement',
            // E1 : le titre reflète le nombre d'alarmes de l'équipement courant.
            bind: { title: 'Détail équipement — {nbAlarmes} alarme(s)' },
            bodyPadding: 12,
            layout: { type: 'vbox', align: 'stretch' },
            defaultType: 'displayfield',
            items: [
                { fieldLabel: 'Nom',  bind: '{equipementCourant.nom}' },
                { fieldLabel: 'État', bind: '{equipementCourant.etat}' },
                {
                    xtype: 'component', padding: '8 0 0 0',
                    html: '<b style="color:#E5534B">Équipement en défaut</b>',
                    bind: { hidden: '{!enDefaut}' }
                }
            ]
        },
        {
            // E2 : la grille lit le chained store ; elle reflète la source
            // (non acquittées) sans jamais la recharger.
            region: 'south',
            xtype: 'grid',
            title: 'Alarmes actives',
            height: 160,
            split: true,
            collapsible: true,
            bind: { store: '{alarmesActives}' },
            columns: [
                { text: 'Sévérité', dataIndex: 'severite', width: 100 },
                { text: 'Message',  dataIndex: 'message',  flex: 1 }
            ]
        }
    ]
});
