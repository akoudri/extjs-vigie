#!/usr/bin/env node
/**
 * Lab 5 - Extension E3 : génère une base volumineuse pour json-server.
 *
 * Reprend sites/zones/équipements de mock/db.json et remplace la collection
 * `alarmes` par N alarmes générées (défaut : 10 000). Écrit mock/db-large.json,
 * servi par ./mock-large.sh - la base de référence mock/db.json reste intacte.
 *
 * Usage : node mock/genere-alarmes.js [nombre]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const N = parseInt(process.argv[2], 10) || 10000;
const src = path.join(__dirname, 'db.json');
const dest = path.join(__dirname, 'db-large.json');

const db = JSON.parse(fs.readFileSync(src, 'utf8'));

const SITES = ['Usine Nord', 'Usine Sud'];
const SEVERITES = ['haute', 'moyenne', 'basse'];
const MESSAGES = [
    'Pression basse', 'Température élevée', 'Vibration anormale',
    'Débit hors plage', 'Capteur muet', 'Maintenance planifiée'
];
const EQUIPEMENTS = db.equipements.map(e => e.id);
const BASE = Date.UTC(2024, 5, 1);   // 01/06/2024 en UTC (toISOString reste cohérent)

db.alarmes = Array.from({ length: N }, (_, i) => ({
    id: i + 1,
    equipementId: EQUIPEMENTS[i % EQUIPEMENTS.length],
    site: SITES[i % SITES.length],
    severite: SEVERITES[i % SEVERITES.length],
    message: MESSAGES[i % MESSAGES.length] + ' #' + (i + 1),
    acquittee: i % 4 === 0,
    // une alarme par minute à partir du 01/06/2024, format ISO local
    horodatage: new Date(BASE + i * 60000).toISOString().slice(0, 19)
}));

fs.writeFileSync(dest, JSON.stringify(db));
console.log(`${dest} : ${N} alarmes générées.`);
