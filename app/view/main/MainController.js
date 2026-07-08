/**
 * ViewController de la vue principale - Lab 6.
 *
 * `onNodeSelect` est le pivot du dashboard : il traduit la sélection d'un nœud
 * de l'arbre en filtrage du journal, chargement du chart de télémétrie et
 * synchronisation du fil d'Ariane.
 */
Ext.define('VIGIE.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires: ['VIGIE.domain.Equipement'],

    // E2 (Lab 7) : bascule FR ↔ EN — recharge l'app dans l'autre locale,
    // deep-link #equipement/:id préservé (voir VIGIE.Locale.basculer).
    onBasculerLocale: function () {
        VIGIE.Locale.basculer();
    },

    // Route protégée : `force` rejoue la route même si le hash vaut déjà
    // « admin » (login refermé sans se connecter, fenêtre déjà fermée…).
    onAdmin: function () {
        this.redirectTo('admin', { force: true });
    },

    onApropos: function () {
        Ext.create('Ext.window.Window', {
            title: 'À propos de VIGIE',
            modal: true,
            width: 360, height: 200,
            layout: 'fit',
            items: [{
                xtype: 'component', padding: 16,
                html: 'VIGIE — console de supervision.<br>Édition de formation.'
            }]
        }).show();
    },

    // Sélection d'un nœud → filtrage journal + chart + fil d'Ariane.
    onNodeSelect: function (tree, node) {
        var vm = this.getViewModel(),
            alarmes = this.lookup('journal').getStore(),
            mesures = this.lookup('chart').getStore();

        this.lookup('ariane').setSelection(node);   // synchronise le fil d'Ariane
        alarmes.clearFilter();

        if (node.get('type') === 'equipement') {
            var id = node.get('equipementId');
            alarmes.filter('equipementId', id);
            mesures.getProxy().setExtraParam('equipementId', id);
            mesures.load();
            // E2 : l'enregistrement REST devient l'équipement courant, que le
            // formulaire de configuration édite par binding bidirectionnel.
            vm.set('equipementCourant', vm.getStore('equipements').getById(id));
        } else {
            vm.set('equipementCourant', null);
            mesures.getProxy().setExtraParam('equipementId', null);
            if (node.get('type') === 'site') {
                alarmes.filter('site', node.get('site'));
            }
            mesures.removeAll();   // pas de télémétrie agrégée site/zone
        }
    },

    // E1 : persiste un équipement déplacé vers une autre zone. Le nœud d'arbre
    // n'est qu'une vue : la vérité est l'enregistrement REST, dont on met à
    // jour le zoneId avant de le sauvegarder via son proxy.
    onNodeDrop: function (targetEl, data) {
        var equipements = this.getViewModel().getStore('equipements');

        Ext.Array.forEach(data.records, function (node) {
            if (node.get('type') !== 'equipement') {
                return;
            }

            var zone = node.parentNode,
                site = zone && zone.parentNode,
                rec  = equipements.getById(node.get('equipementId'));

            if (!rec || !zone || zone.get('type') !== 'zone') {
                return;   // déposé hors d'une zone : rien à persister
            }

            rec.set('zoneId', zone.get('zoneId'));
            rec.save();

            // Cohérence du pilotage : le champ site du nœud sert au filtrage
            // du journal ; il doit suivre le nouveau rattachement.
            if (site && site.get('type') === 'site') {
                node.set('site', site.get('site'));
            }
        });
    },

    // E2 : pousse les modifications du formulaire via le proxy rest du Model.
    onEnregistrer: function () {
        var eq = this.getViewModel().get('equipementCourant');

        if (eq && eq.isValid()) {
            eq.save();
        }
    },

    // E3 : simulation d'une télémétrie vivante. Le chart écoute son store :
    // chaque add() redessine la ligne, sans load() ni binding supplémentaire.
    onToggleSimulation: function (btn, pressed) {
        if (pressed) {
            this.simulation = Ext.interval(this.ajouterMesure, 2000, this);
        } else {
            Ext.uninterval(this.simulation);
            this.simulation = null;
        }
    },

    ajouterMesure: function () {
        var mesures = this.lookup('chart').getStore(),
            eqId = mesures.getProxy().getExtraParams().equipementId,
            last = mesures.last();

        if (!eqId) {
            return;   // aucun équipement sélectionné : rien à simuler
        }

        mesures.add({
            equipementId: eqId,
            horodatage: last ? Ext.Date.add(last.get('horodatage'), Ext.Date.MINUTE, 5) : new Date(),
            valeur: last ? Math.max(0, last.get('valeur') + Math.round((Math.random() - 0.5) * 10)) : 50
        });
    },

    destroy: function () {
        if (this.simulation) {
            Ext.uninterval(this.simulation);
        }
        this.callParent();
    },

    // Conservés du Lab D3 (relais d'événement réutilisable).
    onChoisir: function (btn) {
        var eq = Ext.create('VIGIE.domain.Equipement', { nom: btn.eqNom, etat: btn.eqEtat });
        this.getView().fireEvent('equipementchoisi', this.getView(), eq);
    },

    onEquipementChoisi: function (src, eq) {
        this.getViewModel().set('equipementCourant', eq);
    }
});
