/**
 * Shell applicatif de VIGIE.
 *
 * Lab 1 : simple panneau d'accueil (le système de classes est testé en console).
 * Lab 2 : ce panneau deviendra un layout `border` (barre nord, panneau « Sites »
 * à l'ouest, contenu central).
 */
Ext.define('VIGIE.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    title: 'VIGIE - Supervision (lab 1)',
    bodyPadding: 16,
    html: 'Socle &amp; système de classes en place.<br>'
});
