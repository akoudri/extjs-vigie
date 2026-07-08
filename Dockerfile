# ------------------------------------------------------------------
# Stage 1 : build de production ExtJS (webpack + ext-webpack-plugin)
#
# Contraintes héritées de build-prod.sh :
#   - Sencha Cmd 8 exige un JDK 8 -> copié depuis l'image Temurin
#     (focal = glibc 2.31, identique à bullseye).
#   - Le slicer d'images legacy (PhantomJS, embarqué dans Sencha Cmd)
#     a besoin de fontconfig/freetype et plante avec OpenSSL 3 ;
#     base bullseye (OpenSSL 1.1) + OPENSSL_CONF=/dev/null.
# ------------------------------------------------------------------
FROM node:20-bullseye AS builder

COPY --from=eclipse-temurin:8-jdk-focal /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk \
    SENCHA_CMD_JAVA_HOME=/opt/java/openjdk \
    PATH=/opt/java/openjdk/bin:$PATH \
    OPENSSL_CONF=/dev/null

RUN apt-get update \
    && apt-get install -y --no-install-recommends libfontconfig1 libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Couche dépendances (mise en cache tant que le lockfile ne change pas).
# Les paquets @sencha 8.x sont sur le registre npm public : pas d'auth.
COPY package.json package-lock.json ./
RUN npm ci

# Sources de l'app (node_modules exclu via .dockerignore)
COPY . .

# Mêmes --env que build-prod.sh : sans eux, ext-webpack-plugin impose
# ses défauts (modern + theme-material) au lieu du profil desktop.
RUN npm run build -- --env toolkit=classic --env theme=theme-vigie --env packages=charts

# ------------------------------------------------------------------
# Stage 2 : serveur statique nginx
# ------------------------------------------------------------------
FROM nginx:1.27-alpine

COPY --from=builder /app/build/production/VIGIE/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO /dev/null http://localhost/ || exit 1
