// import-imgmetadata-to-db.js
// Detta skript återställer tabellen `images` och importerar metadata
// för varje bild från `jpg-metadata.json`. Tabellen innehåller endast
// en autoinkrementerande id och en JSON-kolumn som lagrar all metadata.

import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import dbcreds from './db-credentials.js';

async function importMetadata() {
  // Namnet på tabellen vi arbetar med
  const TABLE = 'images';

  // Läs in och tolka metadata från JSON-filen
  const jsonFile = './jpg-metadata.json';
  const jsonString = await fs.readFile(jsonFile, 'utf-8');
  const data = JSON.parse(jsonString);

  // Skapa databasanslutning
  const db = await mysql.createConnection(dbcreds);
  db.config.namedPlaceholders = true;

  try {
    // Skapa tabellen om den inte finns, annars rensa den
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`${TABLE}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metadata JSON NOT NULL,
        fileName VARCHAR(255) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName'))) STORED,
        INDEX idx_images_fileName (fileName)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Rensa tabellen (tar bort alla gamla rader)
    await db.execute(`TRUNCATE TABLE \`${TABLE}\`;`);

    // Förbered SQL-sats för att infoga metadata
    const insertSql = `INSERT INTO \`${TABLE}\` (metadata) VALUES (?)`;

    // Loop igenom och infoga varje rad från JSON-filen
    for (const item of data) {
      await db.execute(insertSql, [JSON.stringify(item)]);
    }

    console.log(`✅ Importerat ${data.length} rader till tabellen '${TABLE}'.`);
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
