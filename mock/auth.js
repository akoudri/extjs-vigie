/**
 * Middleware json-server : authentification de DÉMONSTRATION.
 *
 * Branché via `--middlewares mock/auth.js` (voir mock.sh), il s'exécute AVANT
 * le routeur CRUD de json-server :
 *   - POST /login            → délivre un token si les identifiants sont bons ;
 *   - /statistiques[/...]    → exige l'en-tête `Authorization: Bearer <token>`
 *                              (la RESSOURCE est protégée, pas seulement l'écran).
 *
 * ⚠️ Pédagogie uniquement : token statique, identifiants en clair, pas de TLS.
 * Le point à retenir est ailleurs : c'est le SERVEUR qui refuse (401), quoi
 * que fasse le client — la vraie sécurité ne se joue jamais côté navigateur.
 */
var TOKEN = 'vigie-demo-token';
var UTILISATEUR = { login: 'admin', password: 'vigie' };

module.exports = function (req, res, next) {
    if (req.method === 'POST' && req.path === '/login') {
        // En mode CLI, json-server a déjà parsé le corps JSON (body-parser
        // fait partie de ses middlewares par défaut) : req.body est prêt.
        var corps = req.body || {};

        if (corps.login === UTILISATEUR.login && corps.password === UTILISATEUR.password) {
            res.jsonp({ token: TOKEN, nom: 'Administrateur' });
        } else {
            res.status(401).jsonp({ erreur: 'Identifiants invalides' });
        }
        return;   // réponse produite ici : ne pas passer au routeur
    }

    // startsWith : couvre aussi /statistiques/:id (PUT, DELETE…).
    if (req.path.indexOf('/statistiques') === 0
        && req.headers.authorization !== 'Bearer ' + TOKEN) {
        return res.status(401).jsonp({ erreur: 'Authentification requise' });
    }

    next();
};
