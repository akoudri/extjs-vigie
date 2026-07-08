/**
 * Shell applicatif de VIGIE - Lab 6 (dashboard) + Lab 7 (SPA).
 *
 * Assemble la sélection : arbre Site → Zone → Équipement (ouest), fil d'Ariane
 * (nord, même TreeStore que l'arbre), chart de télémétrie + journal filtré
 * (centre). La sélection d'un nœud pilote l'ensemble via onNodeSelect.
 *
 * E3 (esquisse) : pour une vraie cible tactile, on ajouterait un build
 * `modern` dans app.json — composants du toolkit modern (Ext.grid.Grid,
 * navigation par cartes plutôt que border layout, événements touch natifs),
 * le microloader servant le bon build selon le device ; stores, modèles et
 * ViewModels resteraient partagés. Ici on reste en classic : le responsive
 * ré-agence les régions (arbre ouest → bandeau nord sous 600 px).
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    controller: 'main',
    viewModel: 'main',

    // Lab 8 : toutes ces classes ne sont référencées que par des ALIAS chaîne
    // (`plugins: 'responsive'`, `store: { type: 'mesures' }`, `axes[].type`,
    // `series[].type`), que le compilateur ne résout pas. Sans ces requires
    // explicites, le build de PRODUCTION démarre sur « c is not a
    // constructor » (en dev, tout le framework est chargé, rien ne manque).
    requires: [
        'VIGIE.view.alarmes.Journal', 'VIGIE.Libelles', 'VIGIE.Locale',
        'VIGIE.store.Mesures',
        'Ext.plugin.Responsive',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Time',
        'Ext.chart.series.Line',
        'Ext.draw.sprite.Circle'    // marqueur par défaut de `marker: true`
    ],

    layout: 'border',

    listeners: {
        equipementchoisi: 'onEquipementChoisi'
    },

    // Libellés résolus à l'instanciation : le singleton est garanti défini à
    // ce moment — et déjà substitué par VIGIE.Locale si `?locale=en` (E2).
    initComponent: function () {
        var L = VIGIE.Libelles,
            regions = {};

        Ext.Array.each(this.items, function (i) { regions[i.region] = i; });

        regions.west.title = L.SITES;
        regions.center.items[0].title = L.TELEMETRIE;

        Ext.Array.each(regions.north.items, function (i) {
            switch (i.itemId) {
                case 'champFiltre': i.emptyText = L.FILTRER; break;
                case 'btnApropos':  i.text = L.APROPOS; break;
                // E2 : le bouton affiche la locale CIBLE de la bascule.
                case 'btnLocale':   i.text = (VIGIE.Locale.locale === 'fr') ? 'EN' : 'FR'; break;
            }
        });

        this.callParent();
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
                { xtype: 'textfield', itemId: 'champFiltre', width: 200 },
                { itemId: 'btnApropos', reference: 'btnApropos', handler: 'onApropos' },
                // E2 : bascule de locale — recharge l'app avec ?locale=en|fr.
                { itemId: 'btnLocale', handler: 'onBasculerLocale',
                  tooltip: 'Changer de langue / switch language' }
            ]
        },
        {
            region: 'west',
            xtype: 'treepanel',
            reference: 'arbre',
            itemId: 'arbreSites',
            width: 280,
            split: true,
            rootVisible: false,
            bind: { store: '{arbo}' },
            listeners: { select: 'onNodeSelect' },
            // Lab 7 : largeur adaptative. E3 : sous 600 px, l'arbre quitte la
            // région ouest pour un bandeau nord replié en hauteur — chart et
            // journal reprennent toute la largeur, empilés dessous.
            plugins: 'responsive',
            responsiveConfig: {
                'width < 600':  { region: 'north', height: 150 },
                'width >= 600': { region: 'west' },
                'width >= 600 && width < 900': { width: 180 },
                'width >= 900': { width: 280 }
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
                    // Lab D7 : hauteur adaptative.
                    plugins: 'responsive',
                    responsiveConfig: {
                        'height < 700':  { height: 160 },
                        'height >= 700': { height: 220 }
                    },
                    store: { type: 'mesures' },
                    axes: [
                        { type: 'numeric', position: 'left',   title: 'Valeur' },
                        { type: 'time',    position: 'bottom', title: 'Temps', dateFormat: 'H:i' }
                    ],
                    series: [{ type: 'line', xField: 'horodatage', yField: 'valeur', marker: true }]
                },
                { xtype: 'journal-alarmes', reference: 'journal', flex: 1 }
            ]
        }
    ]
});
