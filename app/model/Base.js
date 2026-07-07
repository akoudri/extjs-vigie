/**
 * Lab 4 - Extension E1 : Model de base de la couche données.
 *
 * Déclare le namespace du schéma : les entityName deviennent les noms courts
 * (`Equipement`, `Alarme`) au lieu des noms de classe complets. Sans cela,
 * `reference: 'Equipement'` ne résout jamais l'entité et l'association
 * `equipement.alarmes()` n'est pas générée.
 */
Ext.define('VIGIE.model.Base', {
    extend: 'Ext.data.Model',

    schema: {
        namespace: 'VIGIE.model'
    }
});
