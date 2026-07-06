/**
 * Lab 1 (extension E1) - Comportement transverse « horodatable ».
 *
 * Mixin = *composition*, pas héritage : n'importe quelle classe peut l'intégrer
 * via `mixins` sans modifier sa chaîne d'héritage. Ici on dote le porteur d'un
 * horodatage de dernière mise à jour.
 */
Ext.define('VIGIE.mixin.Horodatable', {
    horodater: function () {
        this.maj = new Date();
        return this.maj;
    },

    derniereMaj: function () {
        return this.maj || null;
    }
});
