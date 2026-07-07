/**
 * Lab 5 - Extension E3 : reader JSON qui lit le total dans un en-tête HTTP.
 *
 * json-server ne renvoie pas le total dans le corps de la réponse (le corps
 * est le tableau brut de la page) mais dans l'en-tête `X-Total-Count`
 * (exposé en CORS via `Access-Control-Expose-Headers`). Or un
 * `BufferedStore` a besoin du total pour dimensionner son scroll virtuel :
 * on complète donc le ResultSet après la lecture standard.
 */
Ext.define('VIGIE.util.TotalHeaderReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.totalheader',

    read: function (response, readOptions) {
        var resultSet = this.callParent([response, readOptions]),
            total = response && response.getResponseHeader &&
                    response.getResponseHeader('X-Total-Count');

        if (total != null) {
            resultSet.setTotal(parseInt(total, 10));
        }
        return resultSet;
    }
});
