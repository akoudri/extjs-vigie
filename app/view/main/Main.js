/**
 * Shell applicatif de VIGIE - Lab 6 (dashboard).
 *
 * Assemble la sélection : arbre Site → Zone → Équipement (ouest), fil d'Ariane
 * (nord, même TreeStore que l'arbre), chart de télémétrie + journal filtré
 * (centre). La sélection d'un nœud pilote l'ensemble via onNodeSelect.
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    controller: 'main',
    viewModel: 'main',

    requires: ['VIGIE.view.alarmes.Journal'],

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
                {
                    xtype: 'breadcrumb',
                    reference: 'ariane',
                    bind: { store: '{arbo}' }
                },
                { xtype: 'tbfill' },
                { xtype: 'textfield', emptyText: 'Filtrer…', width: 200 },
                { text: 'À propos', reference: 'btnApropos', handler: 'onApropos' }
            ]
        },
        {
            region: 'west',
            xtype: 'treepanel',
            reference: 'arbre',
            title: 'Sites',
            width: 280,
            split: true,
            rootVisible: false,
            bind: { store: '{arbo}' },
            listeners: { select: 'onNodeSelect' },
            // E1 : réorganisation par glisser-déposer ; le drop est persisté
            // côté API (zoneId de l'équipement) par onNodeDrop.
            viewConfig: {
                plugins: { treeviewdragdrop: { appendOnly: false } },
                listeners: { drop: 'onNodeDrop' }
            }
        },
        {
            region: 'center',
            xtype: 'panel',
            layout: { type: 'vbox', align: 'stretch' },
            items: [
                {
                    xtype: 'cartesian',
                    reference: 'chart',
                    title: 'Télémétrie',
                    height: 220,
                    store: { type: 'mesures' },
                    // E3 : simulation d'une télémétrie vivante (une mesure/2 s).
                    tbar: [{
                        text: 'Simuler le flux',
                        enableToggle: true,
                        toggleHandler: 'onToggleSimulation'
                    }],
                    axes: [
                        { type: 'numeric', position: 'left',   title: 'Valeur' },
                        { type: 'time',    position: 'bottom', title: 'Temps', dateFormat: 'H:i' }
                    ],
                    series: [{ type: 'line', xField: 'horodatage', yField: 'valeur', marker: true }]
                },
                { xtype: 'journal-alarmes', reference: 'journal', flex: 1 }
            ]
        },
        {
            // E2 : formulaire de configuration lié à l'enregistrement courant
            // du ViewModel ; le bouton ne s'active que si le record est dirty.
            region: 'east',
            xtype: 'form',
            title: 'Configuration',
            reference: 'formConfig',
            width: 260,
            split: true,
            bodyPadding: 10,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nom',
                    bind: '{equipementCourant.nom}',
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'État',
                    bind: '{equipementCourant.etat}',
                    store: ['OK', 'DEFAUT', 'MAINTENANCE'],
                    editable: false
                }
            ],
            buttons: [
                {
                    text: 'Enregistrer',
                    handler: 'onEnregistrer',
                    bind: { disabled: '{!equipementCourant.dirty}' }
                }
            ]
        }
    ]
});
