/**
 * Shell applicatif de VIGIE - Lab 3 (architecture MVVM).
 *
 * Plus aucune logique inline : le handler « À propos » et le relais de sélection
 * vivent dans le ViewController ; le détail est alimenté par databinding depuis
 * le ViewModel (maître-détail sans code de synchronisation).
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
                { xtype: 'component', html: '<b>VIGIE</b> - Supervision' },
                { xtype: 'tbfill' },
                { xtype: 'textfield', emptyText: 'Filtrer…', width: 200 },
                // Source de sélection simulée (l'arbre des sites viendra au Lab D6).
                { text: 'P-12 (OK)',    handler: 'onChoisir', eqNom: 'Pompe P-12', eqEtat: 'OK' },
                { text: 'V-3 (DÉFAUT)', handler: 'onChoisir', eqNom: 'Vanne V-3',  eqEtat: 'DEFAUT' },
                { text: 'À propos', reference: 'btnApropos', handler: 'onApropos' }
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
            html: '<i>Arbre des sites - à venir (Deck 6)</i>'
        },
        {
            region: 'center',
            xtype: 'panel',
            title: 'Détail équipement',
            bodyPadding: 12,
            layout: { type: 'vbox', align: 'stretch' },
            defaultType: 'displayfield',
            items: [
                { fieldLabel: 'Nom',  bind: '{nomCourant}' },
                { fieldLabel: 'État', bind: '{etatCourant}' },
                // Extension E1 : bandeau visible seulement si l'équipement est en défaut.
                {
                    xtype: 'component', padding: '8 0 0 0',
                    html: '<b style="color:#E5534B">Équipement en défaut</b>',
                    bind: { hidden: '{!enDefaut}' }
                },

                // Extension E2 : binding bidirectionnel. Le champ de saisie et son
                // écho lisent la MÊME clé {seuil} ; éditer l'un met à jour l'autre,
                // preuve que le ViewModel est la source unique de vérité.
                { xtype: 'numberfield',  fieldLabel: 'Seuil',        bind: '{seuil}' },
                { xtype: 'displayfield', fieldLabel: 'Seuil (écho)', bind: '{seuil}' },

                // Extension E3 : reflet d'une valeur haute fréquence via la formula
                // `mesureFormatee` (voir le churn dans la console).
                { xtype: 'displayfield', fieldLabel: 'Mesure', bind: '{mesureFormatee}' }
            ]
        }
    ]
});
