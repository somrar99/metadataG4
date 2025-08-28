// import-imgmetadata-to-db.js
// This script resets the `images` table and imports metadata for each
// image from the `jpg-metadata.json` file. The table only has an auto-
// incrementing id and a JSON column, which stores all metadata (including
// the file name) as a single JSON document.

import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import dbcreds from './db-credentials.js';

async function importMetadata() {
  // Name of the table to drop and recreate
  const TABLE = 'images';

  // Read and parse the metadata JSON file
  const jsonFile = './jpg-metadata.json';
  const jsonString = await fs.readFile(jsonFile, 'utf-8');
  const data = JSON.parse(jsonString);

  // Connect to the database
  const db = await mysql.createConnection(dbcreds);
  // Allow named placeholders if you need them later
  db.config.namedPlaceholders = true;

  try {
    // Start a transaction
    await db.beginTransaction();

    // Disable foreign key checks during table drop/creation
    await db.execute('SET FOREIGN_KEY_CHECKS = 0;');

    // Drop old table if it exists
    await db.execute(`DROP TABLE IF EXISTS \`${TABLE}\`;`);

    // Create new table with only id and metadata columns
    await db.execute(`
      CREATE TABLE \`${TABLE}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metadata JSON NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1;');

    // Prepared statement for inserting JSON metadata
    const insertSql = `INSERT INTO \`${TABLE}\` (metadata) VALUES (?)`;

    // Insert each metadata record into the table
    for (const item of data) {
      // item already contains fileName and all other metadata fields
      await db.execute(insertSql, [JSON.stringify(item)]);
    }

    // Commit the transaction
    await db.commit();
    console.log(`Imported ${data.length} records into the '${TABLE}' table.`);
  } catch (err) {
    // Roll back the transaction if something goes wrong
    await db.rollback();
    console.error('Error importing metadata:', err);
  } finally {
    // Close the database connection
    await db.end();
  }
}

importMetadata().catch((err) => {
  console.error('Unhandled error:', err);
});
