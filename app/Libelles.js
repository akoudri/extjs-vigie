/**
 * Lab 7 - Singleton centralisant les libellés applicatifs.
 *
 * Premier pas vers l'internationalisation : les vues référencent ces constantes
 * au lieu de chaînes en dur. (L'i18n des composants natifs — formats de date,
 * messages de validation — relève du package de locale, pas de ce singleton.)
 */
Ext.define('VIGIE.Libelles', {
    singleton: true,

    SITES:       'Sites',
    JOURNAL:     "Journal d'alarmes",
    CONFIG:      'Configuration',
    ENREGISTRER: 'Enregistrer',
    EXPORTER:    'Exporter (CSV)',
    FILTRER:     'Filtrer…',
    APROPOS:     'À propos',
    TELEMETRIE:  'Télémétrie'
});
