/**
 * Lab 5 - Extension E2 : renderers de sévérité, du plus lent au plus rapide.
 *
 * Le renderer est un CHEMIN CHAUD : appelé pour chaque cellule visible à
 * chaque rafraîchissement (scroll compris). Trois versions comparées :
 *
 *  1. `rendererLent`  : volontairement coûteux - table de couleurs reconstruite
 *     et « recalcul » simulé à CHAQUE cellule. À mesurer, jamais à livrer.
 *  2. (intermédiaire, non retenue) : précalculer la table de couleurs hors du
 *     renderer - c'est ce que fait `COULEURS` ci-dessous - mais en concaténant
 *     toujours du HTML inline par cellule.
 *  3. `renderer` : version optimisée retenue - une classe CSS précalculée
 *     posée via `metaData.tdCls`. Aucun objet créé, aucune concaténation de
 *     style inline ; le style est résolu une seule fois par le moteur CSS.
 *
 * La bascule lent/optimisé (menu « Perf » du journal) mesure le temps de
 * `view.refresh()` dans la console pour objectiver l'écart.
 */
Ext.define('VIGIE.util.Severite', {
    singleton: true,

    requires: ['Ext.util.CSS'],

    /** Table précalculée UNE fois, hors du chemin chaud. */
    COULEURS: {
        haute:   '#E5534B',
        moyenne: '#F2A340',
        basse:   '#5B6876'
    },

    /**
     * Renderer optimisé : pose une classe CSS sur la cellule (`tdCls`) et
     * rend la valeur brute. Les règles CSS sont injectées une seule fois
     * par `injecterCss`.
     */
    renderer: function (v, metaData) {
        metaData.tdCls = 'vigie-sev-' + v;
        return v;
    },

    /**
     * Renderer volontairement LOURD (E2) : reconstruit la table de couleurs
     * et simule un recalcul (sérialisations répétées) à chaque cellule.
     * Sert uniquement de point de comparaison pour la mesure.
     */
    rendererLent: function (v) {
        var table = {}, i;
        Ext.Object.each({ haute: '#E5534B', moyenne: '#F2A340', basse: '#5B6876' },
            function (sev, coul) { table[sev] = coul; });
        for (i = 0; i < 1000; i++) {
            JSON.parse(JSON.stringify(table));      // « calcul » factice
        }
        return '<span style="color:' + table[v] + ';font-weight:bold">' + v + '</span>';
    },

    /**
     * Injecte les règles `.vigie-sev-*` (une par sévérité) dans une feuille
     * de style dédiée. Idempotent. En production, ces règles vivraient dans
     * le thème SCSS de l'application.
     */
    injecterCss: function () {
        var css = '';
        if (this.cssInjectee) {
            return;
        }
        this.cssInjectee = true;
        Ext.Object.each(this.COULEURS, function (sev, coul) {
            css += '.vigie-sev-' + sev + ' .x-grid-cell-inner { color: ' + coul + '; font-weight: bold; }\n';
        });
        Ext.util.CSS.createStyleSheet(css, 'vigie-severite');
    }
});
