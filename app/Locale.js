/**
 * Lab 7 — Locale applicative : FR par défaut, EN via `?locale=en` (E2).
 *
 * Deux responsabilités bien distinctes :
 *
 *  1. Libellés applicatifs (E2) : « sélectionner le bon singleton ». Les vues
 *     référencent VIGIE.Libelles ; en anglais on y substitue VIGIE.LibellesEN
 *     AVANT l'instanciation des vues — ce singleton est chargé par
 *     l'Application, donc avant la mainView.
 *
 *  2. Composants natifs (dates, formats, MessageBox, validations) : cela
 *     relève du PACKAGE DE LOCALE ExtJS (`"locale"` dans app.json), pas d'un
 *     singleton de libellés — le package surcharge des classes du FRAMEWORK
 *     (Ext.Date, Ext.form.field.*, Ext.MessageBox…) que nos vues ne
 *     contrôlent pas. Ce package n'étant pas disponible hors registre Sencha,
 *     on applique ici les réglages FR essentiels à la main ; en EN, rien à
 *     faire : l'anglais est la langue native du framework.
 */
Ext.define('VIGIE.Locale', {
    singleton: true,

    requires: ['VIGIE.Libelles', 'VIGIE.LibellesEN'],

    /** Locale active : 'fr' (défaut) ou 'en'. */
    locale: 'fr',

    constructor: function () {
        var params = Ext.Object.fromQueryString(window.location.search.substring(1));

        this.locale = (params.locale === 'en') ? 'en' : 'fr';

        if (this.locale === 'en') {
            // E2 : substitution du singleton de libellés. Les vues qui font
            // `VIGIE.Libelles.X` à l'instanciation liront les textes anglais.
            VIGIE.Libelles = VIGIE.LibellesEN;
            return;   // composants natifs : défauts anglais du framework
        }

        Ext.apply(Ext.Date, {
            dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            defaultFormat: 'd/m/Y'
        });

        if (Ext.util && Ext.util.Format) {
            Ext.apply(Ext.util.Format, {
                thousandSeparator: ' ',
                decimalSeparator: ',',
                dateFormat: 'd/m/Y'
            });
        }

        if (Ext.MessageBox) {
            Ext.MessageBox.buttonText = {
                ok: 'OK', cancel: 'Annuler', yes: 'Oui', no: 'Non'
            };
        }
    },

    /**
     * E2 — recharge l'application dans l'autre locale. Le hash est préservé :
     * le deep-link `#equipement/:id` rouvre le même équipement après bascule.
     */
    basculer: function () {
        var cible = (this.locale === 'fr') ? 'en' : 'fr';

        window.location.href = window.location.pathname +
            '?locale=' + cible + window.location.hash;
    }
});
