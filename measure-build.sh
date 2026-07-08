#!/usr/bin/env bash
# Lab 8 - Extension E3 : mesure des builds development vs production.
#
# Compare ce que le navigateur devrait télécharger dans chaque mode :
#   - development : pas de bundle ; les sources sont servies fichier par
#     fichier selon generatedFiles/desktop.json (loadOrder du microloader).
#   - production  : bundle unique minifié + CSS compilée (build/production/).
# Estime aussi la part du package `charts` (effet d'un `requires` dans
# app.json sur la taille finale). Résultats commentés : test/MESURES.md.
set -e
cd "$(dirname "$0")"

PROD=build/production/VIGIE
JS_PROD=$PROD/generatedFiles/desktop/app.js
CSS_PROD=$PROD/desktop/resources

ko() { du -sk "$@" 2>/dev/null | awk '{s+=$1} END {printf "%d", s}'; }

echo "=== E3 - Build de PRODUCTION ($PROD) ==="
printf 'app.js (bundle)      : %6d Ko  (gzip: %d Ko)\n' \
    "$(ko "$JS_PROD")" "$(gzip -c "$JS_PROD" | wc -c | awk '{print int($1/1024)}')"
printf 'CSS compilée         : %6d Ko\n' "$(ko "$CSS_PROD"/*.css)"
printf 'build complet        : %6d Ko\n' "$(ko "$PROD")"

echo
echo "=== E3 - Mode DEVELOPMENT (sources listées par generatedFiles/desktop.json) ==="
python3 - <<'EOF'
import json, os
d = json.load(open('generatedFiles/desktop.json'))
tot = ch = app = 0
for e in d['loadOrder']:
    p = e['path']
    s = os.path.getsize(p)
    tot += s
    if 'ext-charts' in p:
        ch += s
    if p.startswith('app'):
        app += s
n = len(d['loadOrder'])
print(f"JS chargés           : {tot//1024:6d} Ko  en {n} requêtes (non minifiés)")
print(f"  dont package charts: {ch//1024:6d} Ko  ({ch/tot*100:.1f} %) - le prix du \"requires\": [\"charts\"]")
print(f"  dont code VIGIE    : {app//1024:6d} Ko  ({app/tot*100:.1f} %)")
EOF

echo
echo "Temps de démarrage (premier rendu) : mesure navigateur, voir test/MESURES.md."
echo "Servir la prod :  cd $PROD && npx http-server -p 8088"
