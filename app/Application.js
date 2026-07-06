/**
 * Application VIGIE - point d'entrée.
 *
 * Au fil des labs, `mainView` pointera vers le shell applicatif (VIGIE.view.main.Main).
 * Le bloc d'auto-test de `launch` exerce les classes du lab 1 et journalise les
 * résultats en console (sert de vérification « ça compile et ça tourne »).
 */
Ext.define('VIGIE.Application', {
    extend: 'Ext.app.Application',
    name: 'VIGIE',

    requires: [
        'VIGIE.domain.Equipement',
        'VIGIE.util.SeuilTelemetrie',
        // extension E1 (le mixin Horodatable est tiré par Alarme ; l'override
        // EquipementLibelle est chargé automatiquement via app.json → "overrides")
        'VIGIE.domain.Alarme'
    ],

    mainView: 'VIGIE.view.main.Main',

    launch: function () {
        // Retirer l'écran de chargement injecté par index.html
        var splash = document.getElementById('splash');
        if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        Ext.getBody().removeCls('launching');

        this.autoTestlab1();
        this.autoTestExtensions();
    },

    // --- lab 1 : vérification du système de classes en console ---
    autoTestlab1: function () {
        var eq = Ext.create('VIGIE.domain.Equipement', { nom: 'Pompe P-12', etat: 'OK' });
        console.log('[lab 1] getNom()            =', eq.getNom());        // 'Pompe P-12'
        console.log('[lab 1] estEnDefaut()       =', eq.estEnDefaut());   // false
        eq.setEtat('DEFAUT');
        console.log('[lab 1] estEnDefaut() (DEF) =', eq.estEnDefaut());   // true

        var s = Ext.create('VIGIE.util.SeuilTelemetrie', { seuil: 120 });
        console.log('[lab 1] seuil borné (120)   =', s.getSeuil());       // 100 (apply)
        s.setSeuil(60);                                                // update : seuil 100 -> 60
    },

    // --- lab 1 (extensions E1/E2/E3) : vérification en console ---
    autoTestExtensions: function () {
        // E1 - mixin : composition, pas héritage
        var al = Ext.create('VIGIE.domain.Alarme', { message: 'Surchauffe', severite: 'critique' });
        console.log('[ext E1] horodater()        =', al.horodater());     // Date (via mixin)
        console.log('[ext E1] derniereMaj()      =', al.derniereMaj());   // même Date

        // E2 - override : libelle() ajouté sans toucher au fichier d'origine
        var eq = Ext.create('VIGIE.domain.Equipement', { nom: 'Vanne V-3', etat: 'OK' });
        console.log('[ext E2] libelle()          =', eq.libelle());       // 'Vanne V-3 [OK]'

        // E3 - fabrique statique : construit une instance depuis un objet brut
        var eq2 = VIGIE.domain.Equipement.depuisCapteur({ id: 'P-12', statut: 'DEFAUT' });
        console.log('[ext E3] depuisCapteur nom   =', eq2.getNom());       // 'P-12'
        console.log('[ext E3] depuisCapteur défaut=', eq2.estEnDefaut());  // true
    }
});
