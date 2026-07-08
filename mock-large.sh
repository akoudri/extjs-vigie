#!/usr/bin/env bash
# Lab 5 - Extension E3 : API mock GRAND VOLUME sur le port 3000.
# Génère mock/db-large.json (N alarmes, défaut 10 000) puis le sert.
# Remplace mock.sh le temps de la démo buffered store (même port).
cd "$(dirname "$0")"
node mock/genere-alarmes.js "${1:-10000}"
exec npx json-server@0.17.4 mock/db-large.json --port 3000 --middlewares mock/auth.js
