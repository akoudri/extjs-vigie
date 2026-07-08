#!/usr/bin/env bash
# Lance l'API mock json-server (CRUD complet) sur le port 3000.
# auth.js ajoute POST /login et protège /statistiques (démo authentification).
cd "$(dirname "$0")"
exec npx json-server@0.17.4 --watch mock/db.json --port 3000 --middlewares mock/auth.js
