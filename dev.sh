#!/usr/bin/env bash
# Lance le dev server VIGIE (équivalent `sencha app watch`).
# Sencha Cmd 8 exige JDK 8 : on le force ici sans toucher au Java système.
export JAVA_HOME="$HOME/.sdkman/candidates/java/8.0.492-tem"
export SENCHA_CMD_JAVA_HOME="$JAVA_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
cd "$(dirname "$0")"
exec npm start
