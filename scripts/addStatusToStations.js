// Script to add status field to all stations that don't have it
// Run with: node addStatusToStations.js

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../src/data/mockStationsData.ts');
let content = readFileSync(filePath, 'utf-8');

// Find all instances where we need to add status
// Pattern: network: "...",\n    chargingPoints:
const patterns = [
  {
    search: /network: "Greenway",\n    chargingPoints:/g,
    replace: `network: "Greenway",\n    status: 'active',\n    chargingPoints:`
  },
  {
    search: /network: "ChargeTech",\n    chargingPoints:/g,
    replace: `network: "ChargeTech",\n    status: 'active',\n    chargingPoints:`
  },
  {
    search: /network: "ChargeTech Premium",\n    chargingPoints:/g,
    replace: `network: "ChargeTech Premium",\n    status: 'active',\n    chargingPoints:`
  }
];

patterns.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

writeFileSync(filePath, content, 'utf-8');
console.log('✅ Added status to all stations!');
