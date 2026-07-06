/**
 * Lab 1 (extension E2) - Override de `VIGIE.domain.Equipement`.
 *
 * Enrichit la classe d'origine SANS toucher à son fichier : ajoute une méthode
 * `libelle()` qui produit une étiquette lisible. Placé dans `app/overrides`,
 * il est chargé automatiquement (voir `app.json` → "overrides"), donc aucune
 * déclaration `requires` n'est nécessaire.
 */
Ext.define('VIGIE.overrides.EquipementLibelle', {
    override: 'VIGIE.domain.Equipement',

    libelle: function () {
        return this.getNom() + ' [' + this.getEtat() + ']';
    }
});
