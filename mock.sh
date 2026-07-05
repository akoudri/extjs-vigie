#!/usr/bin/env bash
# Lance l'API mock json-server (CRUD complet) sur le port 3000.
cd "$(dirname "$0")"
exec npx json-server@0.17.4 --watch mock/db.json --port 3000
