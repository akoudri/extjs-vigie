/**
 * ViewController de la vue principale - Lab M3.
 *
 * Accueille la logique extraite de la vue : handler « À propos » et le relais
 * de l'événement métier `equipementchoisi` vers le ViewModel
 * (chemin : événement → ViewController → ViewModel → binding).
 */
Ext.define('VIGIE.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires: [
        'VIGIE.domain.Equipement',
        'Ext.window.Toast'   // E3 : Ext.toast() n'existe que si la classe est requise
    ],

    // E1 : on observe l'équipement courant (piloté par la sélection de grille).
    // À chaque changement, on charge son store d'association eq.alarmes() et on
    // publie le compte dans le ViewModel (le titre du détail y est bindé).
    init: function () {
        this.getViewModel().bind('{equipementCourant}', this.onEquipementCourant, this);
    },

    onEquipementCourant: function (eq) {
        var vm = this.getViewModel();
        if (!eq || typeof eq.alarmes !== 'function') {
            // Pas de sélection, ou association non câblée (Model Alarme non
            // chargé) : on évite de casser le tick de bindings sur un throw.
            if (eq && !eq.alarmes) {
                Ext.log.warn('[E1] association alarmes() absente — vérifier Application.models');
            }
            vm.set('nbAlarmes', 0);
            return;
        }
        // eq.alarmes() : store d'association généré par le `reference` d'Alarme.
        // Le store envoie sa FK via le param `filter` (JSON) qu'ignore
        // json-server → on passe la FK en query param simple, sa convention
        // (`GET /alarmes?equipementId=…`), pour que le serveur filtre vraiment.
        eq.alarmes().load({
            params: { equipementId: eq.getId() },
            callback: function (records) {
                vm.set('nbAlarmes', records.length);
            }
        });
    },

    // E3 : chargement d'un équipement par Promise, avec gestion d'échec.
    // Arrêter json-server puis rejouer → le `catch` affiche l'alerte.
    onTesterChargement: function () {
        Ext.Ajax.request({ url: 'http://localhost:3000/equipements/2' })
            .then(function (response) {
                var eq = Ext.decode(response.responseText);
                Ext.toast('Équipement chargé : ' + eq.nom);
            })
            .catch(function () {
                Ext.Msg.alert('Erreur', 'Équipement indisponible.');
            });
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
