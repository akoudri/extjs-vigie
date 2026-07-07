/**
 * ViewController de la vue principale - Lab 3.
 *
 * Accueille la logique extraite de la vue : handler « À propos » et le relais
 * de l'événement métier `equipementchoisi` vers le ViewModel
 * (chemin : événement → ViewController → ViewModel → binding).
 */
Ext.define('VIGIE.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires: ['VIGIE.domain.Equipement'],

    // Extension E3 : au démarrage du contrôleur, on injecte une télémétrie
    // simulée à haute fréquence. Chaque `set('mesure', …)` force le recalcul de
    // la formula `mesureFormatee` — c'est ce churn que l'on vient observer.
    init: function () {
        var vm = this.getViewModel();
        this.mesureTimer = Ext.interval(function () {
            vm.set('mesure', Math.random() * 100);
        }, 200);
    },

    // On coupe l'intervalle avec la vue : sans ça, le timer survit et continue
    // de pousser des `set` sur un ViewModel détruit.
    destroy: function () {
        Ext.uninterval(this.mesureTimer);
        this.callParent();
    },

    onApropos: function () {
        Ext.create('Ext.window.Window', {
            title: 'À propos de VIGIE',
            modal: true,
            width: 360, height: 200,
            layout: 'fit',
            items: [{
                xtype: 'component', padding: 16,
                html: 'VIGIE - console de supervision.<br>Édition de formation.'
            }]
        }).show();
    },

    // Source de sélection simulée (les boutons portent eqNom / eqEtat).
    onChoisir: function (btn) {
        var eq = Ext.create('VIGIE.domain.Equipement', { nom: btn.eqNom, etat: btn.eqEtat });
        this.getView().fireEvent('equipementchoisi', this.getView(), eq);
    },

    // Traduit l'événement métier en mise à jour du ViewModel (le binding fait le reste).
    onEquipementChoisi: function (src, eq) {
        this.getViewModel().set('equipementCourant', eq);
    }
});
