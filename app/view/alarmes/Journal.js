/**
 * Lab 5 - Journal d'alarmes de VIGIE.
 *
 * Grille : renderer coloré sur la sévérité, regroupement repliable par site,
 * édition de l'acquittement (cellediting + checkcolumn) écrite au serveur
 * (store autoSync → PATCH), et export.
 *
 * Note d'adaptation (vs énoncé) : le package commercial `exporter`
 * (plugin `gridexporter` / `saveDocumentAs`) n'est pas disponible hors registre
 * Sencha. L'export est donc réalisé côté client en CSV (UTF-8 + BOM, ouvrable
 * dans Excel) par la méthode `exportCsv`.
 *
 * Extensions (menu « Perf ») :
 *  - E1 : « Charger 50 000 alarmes » génère le volume en mémoire et mesure le
 *    temps de `loadData` + rendu. Pour comparer SANS rendu bufferisé, ouvrir
 *    l'application avec `?nobuffer` et re-mesurer ; recharger sans le
 *    paramètre rétablit le rendu bufferisé.
 *    Mesures de référence (dev, Chromium) : ~140 ms bufferisé (≈53 lignes
 *    dans le DOM) contre ~10 700 ms sans (50 000 lignes DOM), soit ~75×.
 *  - E2 : la case « Renderer lent » bascule la colonne sévérité sur un
 *    renderer volontairement coûteux (voir VIGIE.util.Severite) et mesure le
 *    `view.refresh()` ; décocher revient à la version optimisée (classe CSS).
 *    Mesure de référence : refresh ~31 ms (lent) contre ~7 ms (optimisé).
 */
Ext.define('VIGIE.view.alarmes.Journal', {
    extend: 'Ext.grid.Panel',
    xtype: 'journal-alarmes',
    title: "Journal d'alarmes",

    requires: [
        'VIGIE.util.Severite',
        'Ext.window.Toast'
    ],

    // Le store global (storeId 'alarmes', instancié par Application.stores),
    // et non `{ type: 'alarmes' }` qui créerait une SECONDE instance en
    // collision de storeId avec celle que chaîne AlarmesActives.
    store: 'alarmes',

    // E1 : rendu bufferisé (défaut) désactivable le temps d'une mesure via
    // l'URL `?nobuffer` - jamais en dur, pour être sûr de le rétablir.
    bufferedRenderer: window.location.search.indexOf('nobuffer') === -1,

    plugins: [
        { ptype: 'cellediting', clicksToEdit: 1 }
    ],

    features: [{
        ftype: 'grouping',
        collapsible: true,
        groupHeaderTpl: '{name} ({rows.length})'
    }],

    tbar: [{
        text: 'Exporter (CSV)',
        handler: function (btn) {
            btn.up('grid').exportCsv();
        }
    }, {
        text: 'Perf',
        menu: [{
            text: 'Charger 50 000 alarmes (E1)',
            handler: function (item) {
                item.up('grid').mesurerGrosVolume();
            }
        }, {
            text: 'Recharger depuis le serveur',
            handler: function (item) {
                item.up('grid').getStore().load();
            }
        }, '-', {
            xtype: 'menucheckitem',
            text: 'Renderer lent (E2)',
            checkHandler: function (item, checked) {
                item.up('grid').basculerRendererSeverite(checked);
            }
        }]
    }],

    columns: [
        { text: 'Horodatage', dataIndex: 'horodatage', xtype: 'datecolumn',
          format: 'd/m/Y H:i', width: 140 },
        // E2 : version optimisée - classe CSS précalculée, rien de créé
        // dans le chemin chaud (cf. VIGIE.util.Severite).
        { text: 'Sévérité', dataIndex: 'severite', width: 110, itemId: 'colSeverite',
          renderer: function (v, metaData) {
              return VIGIE.util.Severite.renderer(v, metaData);
          }
        },
        { text: 'Message', dataIndex: 'message', flex: 1 },
        { xtype: 'checkcolumn', text: 'Acquittée', dataIndex: 'acquittee', width: 100 }
    ],

    initComponent: function () {
        VIGIE.util.Severite.injecterCss();
        this.callParent();
    },

    /**
     * E1 - Tenue de charge : génère 50 000 alarmes en mémoire, les charge
     * dans le store et mesure le temps de chargement + rendu.
     *
     * NB : les enregistrements générés n'existent pas côté serveur ; cocher
     * leur acquittement provoquerait un PATCH en 404 (autoSync). Utiliser
     * « Recharger depuis le serveur » pour revenir aux données réelles.
     */
    mesurerGrosVolume: function () {
        var severites = ['haute', 'moyenne', 'basse'],
            data = [],
            i, t, ms;

        for (i = 0; i < 50000; i++) {
            data.push({
                id: i,
                site: i % 2 ? 'Usine Nord' : 'Usine Sud',
                severite: severites[i % 3],
                message: 'Alarme ' + i,
                acquittee: false,
                horodatage: new Date()
            });
        }

        t = Ext.now();
        this.getStore().loadData(data);
        ms = Ext.now() - t;

        console.log('[E1] 50 000 lignes - chargement + rendu :', ms,
            'ms (bufferedRenderer:', this.bufferedRenderer !== false, ')');
        Ext.toast('50 000 alarmes rendues en ' + ms + ' ms');
    },

    /**
     * E2 - Bascule le renderer de la colonne sévérité (lent ↔ optimisé)
     * et mesure le rafraîchissement complet de la vue.
     */
    basculerRendererSeverite: function (lent) {
        var col = this.down('#colSeverite'),
            Sev = VIGIE.util.Severite,
            view = this.getView(),
            t, ms;

        col.renderer = lent ? Sev.rendererLent : Sev.renderer;

        t = Ext.now();
        view.refresh();
        ms = Ext.now() - t;

        console.log('[E2] refresh avec renderer', lent ? 'LENT' : 'optimisé',
            ':', ms, 'ms');
        Ext.toast('Renderer ' + (lent ? 'lent' : 'optimisé') + ' : refresh en ' + ms + ' ms');
    },

    /**
     * Export CSV de la grille (substitut au package `exporter`).
     * Sépare par « ; », échappe les guillemets, préfixe un BOM UTF-8 pour Excel.
     */
    exportCsv: function () {
        var cols = this.getVisibleColumns(),
            esc = function (v) {
                if (Ext.isDate(v)) { v = Ext.Date.format(v, 'd/m/Y H:i'); }
                return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
            },
            lines = [cols.map(function (c) { return esc(c.text); }).join(';')];

        this.getStore().each(function (rec) {
            lines.push(cols.map(function (c) {
                return esc(c.dataIndex ? rec.get(c.dataIndex) : '');
            }).join(';'));
        });

        var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
            url = URL.createObjectURL(blob),
            a = document.createElement('a');
        a.href = url;
        a.download = 'alarmes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
