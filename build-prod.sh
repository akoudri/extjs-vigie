#!/usr/bin/env bash
# Build de PRODUCTION de VIGIE (équivalent `sencha app build`).
#
# Deux contraintes d'environnement sur ce poste :
#   - Sencha Cmd 8 exige JDK 8 (forcé ici, Java système intact).
#   - Le slicer d'images legacy (PhantomJS) plante avec OpenSSL 3 récent ;
#     OPENSSL_CONF=/dev/null neutralise le chargement de provider fautif.
set -e
export JAVA_HOME="$HOME/.sdkman/candidates/java/8.0.492-tem"
export SENCHA_CMD_JAVA_HOME="$JAVA_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
export OPENSSL_CONF=/dev/null
cd "$(dirname "$0")"
# Lab 8 (E3) : sans ces --env, ext-webpack-plugin impose ses DÉFAUTS
# (toolkit modern + theme-material + package treegrid) au build Cmd, en
# ignorant le profil desktop d'app.json - le build de prod sortait en
# Material approximatif. On aligne explicitement sur app.json.
npm run build -- --env toolkit=classic --env theme=theme-vigie --env packages=charts
echo
echo "Build prêt dans build/production/VIGIE/. Pour le servir :"
echo "  cd build/production/VIGIE && python3 -m http.server 8088"
