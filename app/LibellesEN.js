/**
 * Lab 7 (E2) - Jeu de libellés anglais, miroir clé à clé de VIGIE.Libelles.
 *
 * Les vues ne le référencent JAMAIS directement : elles lisent VIGIE.Libelles,
 * et VIGIE.Locale substitue ce singleton-ci quand l'URL porte `?locale=en`.
 * Toute nouvelle clé ajoutée à Libelles doit l'être ici aussi.
 */
Ext.define('VIGIE.LibellesEN', {
    singleton: true,

    SITES:       'Sites',
    JOURNAL:     'Alarm log',
    CONFIG:      'Configuration',
    ENREGISTRER: 'Save',
    EXPORTER:    'Export (CSV)',
    FILTRER:     'Filter…',
    APROPOS:     'About',
    TELEMETRIE:  'Telemetry',

    // Route protégée #admin
    ADMIN:                  'Admin',
    CONNEXION:              'Sign in',
    DECONNEXION:            'Sign out',
    IDENTIFIANT:            'Username',
    MOT_DE_PASSE:           'Password',
    IDENTIFIANTS_INVALIDES: 'Invalid credentials',
    STATISTIQUES:           'Statistics (restricted)',
    INDICATEUR:             'Indicator',
    VALEUR:                 'Value'
});
