// Write in Terminal: node import-pdfmetadata-to-db.js
// Import the file system module (fs)
import fs from 'fs';

// Import the database driver
import mysql from 'mysql2/promise';

// Get the db-credentials (from git-ignored file)
import dbCreds from './db-credentials.js';

// Read the json string from file
let json = fs.readFileSync('./pdf-metadata.json', 'utf-8');

// Convert from a string to a real data structure
let data = JSON.parse(json);

// Create the connection to database
const db = await mysql.createConnection(dbCreds);

// Allow named placeholders in prepared statements
db.config.namedPlaceholders = true;

// A small function for a query
async function query(sql, listOfValues) {
  let result = await db.execute(sql, listOfValues);
  return result[0];
}

for (let pdf of data) {
  // Kontrollera om `pdf.file` är definierad, annars sätts den till null
  const fileName = pdf.file || null;
  const metadata = pdf;

  // Hoppa över om filnamnet saknas helt
  if (!fileName) {
    console.warn('Hoppar över en post eftersom `file`-egenskapen saknas.');
    continue;
  }

  console.log(`Importerar fil: ${fileName}`);

  let result = await query(`
    INSERT INTO pdfs (fileName, metadata)
    VALUES(?, ?)
  `, [
    fileName,
    JSON.stringify(metadata)
  ]);
  
  console.log('Resultat av import:', result);
}

await db.end();