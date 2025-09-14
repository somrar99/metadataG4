// import-imgmetadata-to-db.js
// ------------------------------------------------------------
// Detta skript återställer tabellen `images` och importerar
// metadata från `jpg-metadata.json`.
// Viktigt tillägg: Vi beräknar och sparar GPS som decimalgrader
// i fälten `latitude` och `longitude` i JSON:en, så att GEO-sökning
// (Haversine i SQL) fungerar direkt.
// Dessutom skapas genererade (STORED) kolumner lat/lon i tabellen
// för snabbare indexerade sökningar.
// ------------------------------------------------------------

import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import dbcreds from './db-credentials.js';

// Hjälpfunktion: DMS (grader, minuter, sekunder) -> decimalgrader
// dms: [deg, min, sec]  (kan vara heltal eller flyttal)
// ref: 'N'/'S' eller 'E'/'W'  (S/W ger negativt tecken)
function dmsToDecimal(dms, ref) {
  if (!dms || !Array.isArray(dms) || dms.length < 3) return null;
  let [deg, min, sec] = dms.map(Number);
  if (![deg, min, sec].every(n => Number.isFinite(n))) return null;

  let dec = Math.abs(deg) + (Math.abs(min) / 60) + (Math.abs(sec) / 3600);
  // Negativt för söder/väst
  if (ref === 'S' || ref === 'W') dec *= -1;
  // Om grader redan är negativa, respektera det (vissa EXIF kan ha -0 osv.)
  if (deg < 0) dec = -Math.abs(dec);
  return dec;
}

// Normalisera/beräkna GPS-fält i ett metadataobjekt
function ensureDecimalGps(meta) {
  // Om redan finns decimaler -> använd dem
  let lat = Number(meta?.latitude);
  let lon = Number(meta?.longitude);

  // Annars försök konvertera från EXIF-format (GPSLatitude/GPSLongitude + Ref)
  if (!Number.isFinite(lat) && meta?.GPSLatitude) {
    lat = dmsToDecimal(meta.GPSLatitude, meta.GPSLatitudeRef);
  }
  if (!Number.isFinite(lon) && meta?.GPSLongitude) {
    lon = dmsToDecimal(meta.GPSLongitude, meta.GPSLongitudeRef);
  }

  // Sätt till null om fortfarande ej giltiga
  if (!Number.isFinite(lat)) lat = null;
  if (!Number.isFinite(lon)) lon = null;

  return { ...meta, latitude: lat, longitude: lon };
}

async function importMetadata() {
  // Namnet på tabellen vi arbetar med
  const TABLE = 'images';

  // Läs in och tolka metadata från JSON-filen
  const jsonFile = './jpg-metadata.json';
  const jsonString = await fs.readFile(jsonFile, 'utf-8');
  const raw = JSON.parse(jsonString);

  // Förvandla varje post så att latitude/longitude finns som decimal
  const data = raw.map(ensureDecimalGps);

  // Skapa databasanslutning
  const db = await mysql.createConnection(dbcreds);
  db.config.namedPlaceholders = true;

  try {
    // Skapa tabellen om den inte finns
    // OBS: Vi har:
    //  - metadata (JSON)
    //  - fileName (genererad från metadata.$.fileName)
    //  - lat/lon (genererade från metadata.$.latitude / .longitude)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`${TABLE}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metadata JSON NOT NULL,

        -- Virtuellt fält för filnamn (stöttar befintlig frontend)
        fileName VARCHAR(255)
          GENERATED ALWAYS AS (
            JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName'))
          ) STORED,

        -- Virtuella fält för decimalgrader (för snabbare sökningar)
        lat DECIMAL(10,6)
          GENERATED ALWAYS AS (
            CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.latitude')) AS DECIMAL(10,6))
          ) STORED,
        lon DECIMAL(10,6)
          GENERATED ALWAYS AS (
            CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.longitude')) AS DECIMAL(10,6))
          ) STORED,

        INDEX idx_images_fileName (fileName),
        INDEX idx_images_lat (lat),
        INDEX idx_images_lon (lon)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Rensa tabellen (tar bort alla gamla rader)
    await db.execute(`TRUNCATE TABLE \`${TABLE}\`;`);

    // Förbered SQL-sats för att infoga metadata
    const insertSql = `INSERT INTO \`${TABLE}\` (metadata) VALUES (?)`;

    let withGps = 0;
    for (const item of data) {
      if (item.latitude != null && item.longitude != null) withGps++;
      await db.execute(insertSql, [JSON.stringify(item)]);
    }

    console.log(`✅ Importerat ${data.length} rader till tabellen '${TABLE}'.`);
    console.log(`ℹ️  Med GPS (decimal): ${withGps} st, utan GPS: ${data.length - withGps} st.`);
    console.log(`👉  Klara fält i JSON: metadata.latitude / metadata.longitude.`);
    console.log(`👉  Virtuella kolumner: images.lat / images.lon (indexerade).`);

  } catch (err) {
    // Om något går fel loggas felet
    console.error('❌ Fel vid import av metadata:', err);
  } finally {
    // Stäng anslutningen
    await db.end();
  }
}

// Kör funktionen
importMetadata().catch(err => {
  console.error('❌ Ohanterat fel:', err);
});
