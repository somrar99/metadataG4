// Skriv i terminalen: node reset-and-import-jpgmetadata-to-db.js
// Syfte: Släng tabellen helt och bygg upp den igen från JPEG-metadata i JSON.

// Importer
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dbCreds from './db-credentials.js';

// Hjälp: __dirname i ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Inställningar ----
// Tabellnamn (byt vid behov)
const TABLE = 'photos';

// Var vi letar efter JSON med JPEG-metadata (välj första som finns)
const CANDIDATES = [
  path.join(__dirname, 'frontend', 'photos', 'metadata.json'),
  path.join(__dirname, 'jpg-metadata.json')
];

// ---- Läs in metadata ----
const jsonPath = CANDIDATES.find(p => fs.existsSync(p));
if (!jsonPath) {
  console.error('Hittar inte JSON med JPEG-metadata. Försökte:\n' + CANDIDATES.join('\n'));
  process.exit(1);
}

console.log('Läser JPEG-metadata från:', jsonPath);
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// ---- Hjälpfunktioner ----
const toDate = v => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

// ---- DB-anslutning ----
const db = await mysql.createConnection(dbCreds);
db.config.namedPlaceholders = true;

try {
  await db.beginTransaction();

  // (Valfritt) Stäng av FK-kontroller om andra tabeller pekar på denna
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');

  // 1) Släng befintlig tabell och bygg upp från noll
  await db.execute(`DROP TABLE IF EXISTS \`${TABLE}\``);

  // Obs: Kolumnen "metadata" är JSON (MySQL 5.7+/8.0). Vid behov ändra till LONGTEXT.
  await db.execute(`
    CREATE TABLE \`${TABLE}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fileName VARCHAR(255) NOT NULL,
      dateTaken DATETIME NULL,
      cameraMake VARCHAR(100) NULL,
      cameraModel VARCHAR(150) NULL,
      latitude DECIMAL(10,7) NULL,
      longitude DECIMAL(10,7) NULL,
      metadata JSON NOT NULL,
      UNIQUE KEY uniq_fileName (fileName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2) Förbered INSERT
  const insertSql = `
    INSERT INTO \`${TABLE}\`
      (fileName, dateTaken, cameraMake, cameraModel, latitude, longitude, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // 3) Fyll tabellen från JSON
  let ok = 0, skipped = 0;
  for (const jpg of data) {
    const fileName = jpg.file ?? null;
    if (!fileName) { skipped++; continue; }

    // Typiska EXIF-fält från exifr: Make, Model, DateTimeOriginal, GPSLatitude, GPSLongitude
    const cameraMake = jpg.Make ?? null;
    const cameraModel = jpg.Model ?? null;
    const dateTaken = toDate(jpg.DateTimeOriginal);
    const latitude = typeof jpg.GPSLatitude === 'number' ? jpg.GPSLatitude : null;
    const longitude = typeof jpg.GPSLongitude === 'number' ? jpg.GPSLongitude : null;

    await db.execute(insertSql, [
      fileName,
      dateTaken,
      cameraMake,
      cameraModel,
      latitude,
      longitude,
      JSON.stringify(jpg)
    ]);
    ok++;
  }

  // 4) Återaktivera FK-kontroller, committa
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');
  await db.commit();

  console.log(`✅ Klart. Tabell "${TABLE}" återskapad och fylld.`);
  console.log(`   Importerat: ${ok}, hoppade över (utan "file"): ${skipped}.`);
} catch (e) {
  await db.rollback();
  console.error('❌ Fel vid återuppbyggnad/import:', e.message);
  process.exit(1);
} finally {
  await db.end();
}
