/**
 * Shell applicatif de VIGIE - Lab 2.
 *
 * Layout `border` : barre nord (titre + filtre + actions), panneau « Sites »
 * repliable/redimensionnable à l'ouest, zone de contenu centrale.
 *
 * Note de continuité : les handlers sont ici des FONCTIONS inline, et la mise à
 * jour du contenu se fait à la main via `fireEvent` + `listeners`. Au Lab M3
 * (MVVM), le handler « À propos » migrera vers le ViewController
 * (`handler: 'onApropos'`), et l'événement `equipementchoisi` deviendra un
 * BINDING maître-détail porté par le ViewModel.
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    // Extension E3 : sans ce `requires`, `VIGIE.domain.Equipement` est
    // « not defined » au clic sur « Sélectionner P-12 ».
    requires: ['VIGIE.domain.Equipement'],

    controller: 'main',     // stub ; exploité au Lab 3
    viewModel: 'main',      // stub ; exploité au Lab 3

    layout: 'border',

    // Extension E3 : on écoute ici l'événement métier émis depuis la barre
    // d'outils et on rafraîchit manuellement la zone de détail (`#contenu`).
    // Depuis E1, `#contenu` est le panneau « Détail » (pas la région center :
    // un setHtml sur un panel qui a des items écraserait le DOM des enfants).
    // Au Lab 3, ce couplage devient un binding déclaratif.
    listeners: {
        equipementchoisi: function (src, eq) {
            src.down('#contenu').setHtml(
                'Équipement : ' + eq.getNom() + ' [' + eq.getEtat() + ']'
            );
        }
    },

    items: [
        {
            region: 'north',
            xtype: 'toolbar',
            height: 48,
            items: [
                { xtype: 'component', html: '<b>VIGIE</b> - Supervision' },
                { xtype: 'tbfill' },
                { xtype: 'textfield', emptyText: 'Filtrer…', width: 200 },

                // Extension E3 : publie un signal métier `equipementchoisi`.
                // `btn.up('app-main')` remonte à la vue, qui porte le listener.
                {
                    text: 'Sélectionner P-12',
                    handler: function (btn) {
                        var main = btn.up('app-main');
                        var eq = Ext.create('VIGIE.domain.Equipement', {
                            nom:  'Pompe P-12',
                            etat: 'OK'
                        });
                        main.fireEvent('equipementchoisi', main, eq);
                    }
                },

                // Socle Étape 2 : fenêtre modale « À propos ».
                // Handler = FONCTION inline (pas de ViewController à ce stade).
                {
                    text: 'À propos',
                    handler: function () {
                        Ext.create('Ext.window.Window', {
                            title: 'À propos de VIGIE',
                            modal: true,
                            width: 360,
                            height: 200,
                            layout: 'fit',
                            items: [{
                                xtype: 'component',
                                padding: 16,
                                html: 'VIGIE - console de supervision.<br>Édition de formation.'
                            }]
                        }).show();
                    }
                }
            ]
        },
        {
            region: 'west',
            title: 'Sites',
            width: 240,
            minWidth: 180,
            collapsible: true,
            split: true,
            bodyPadding: 8,
            html: '<i>Arbre des sites - à venir (Module 6)</i>'
        },

        // Extension E1 : layout imbriqué (hbox dans vbox).
        // - vbox vertical : une barre « Filtres » à hauteur fixe, puis une zone
        //   qui s'étire (flex: 1) découpée en deux colonnes hbox (2 / 1).
        //
        // `itemId: 'contenu'` migre de la région center vers le panneau
        // « Détail » : la cible du listener E3 doit être un panel SANS items
        // (setHtml remplace le corps ; sur la région center il écraserait la
        // composition E1).
        //
        // Extension E2 (piège classique documenté) : `align: 'stretch'` contraint
        // l'axe TRANSVERSE. Sans lui, le vbox ne fixe pas la largeur des enfants
        // → largeur indéterminée → panneaux « invisibles » (rendus vides/écrasés).
        // Symptôme à savoir lire : « l'enfant ne s'affiche pas » = contrainte
        // manquante sur l'axe transverse. On conserve ici l'état CORRIGÉ.
        {
            region: 'center',
            xtype: 'panel',
            layout: { type: 'vbox', align: 'stretch' },
            items: [
                { xtype: 'panel', title: 'Filtres', height: 64 },
                {
                    xtype: 'panel',
                    flex: 1,
                    layout: { type: 'hbox', align: 'stretch' },
                    items: [
                        { xtype: 'panel', title: 'Équipements', flex: 2 },
                        {
                            xtype: 'panel',
                            title: 'Détail',
                            itemId: 'contenu',
                            flex: 1,
                            bodyPadding: 12,
                            html: '<i>Sélectionner un équipement…</i>'
                        }
                    ]
                }
            ]
        }
    ]
});
