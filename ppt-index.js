// Get the db-credentials (from git-ignored file)
import dbCreds from './db-credentials.js';

// Get the database driver
import mysql from 'mysql2/promise';

// Get express so that we can create a web server
import express from 'express';

// Import the file system module (fs)
import fs from 'fs';

// Create the connection to database
const db = await mysql.createConnection(dbCreds);

// Allow named placeholders in prepared statements
db.config.namedPlaceholders = true;


// create the table for powerpoint metadata if it does not exist
await db.query(`
  CREATE TABLE IF NOT EXISTS powerpoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    metadata JSON NOT NULL
  )
`);

// clear out all existing rows in the table
await db.query(`TRUNCATE TABLE powerpoints`);

// Read the json string from file
let json = fs.readFileSync('pp-json-from-csv.json', 'utf-8');

// Convert from a string to a real data structure
let data = JSON.parse(json);


for (let powerpointMetadata of data) {
  // extract the file name (the property digest + '.ppt)
  let fileName = powerpointMetadata.digest + '.ppt';

  // remove the file name
  delete powerpointMetadata.digest;

  // remove sha hashes as well (only needed for file authenticy checks)
  delete powerpointMetadata.sha256;
  delete powerpointMetadata.sha512;

  // console.log things to see that we have correct 
  // filname and metadata
  // (that eventually want to write to the db)
  // console.log('');
  // console.log(fileName);
  // console.log(powerpointMetadata);

  // TODO: Do something like this to INSERT the data in our database
  let result = await db.query(`
    INSERT INTO powerpoints (fileName, metadata)
    VALUES(?, ?)
  `, [fileName, JSON.stringify(powerpointMetadata)]);
  console.log(result);

}


// Create a web server called app
const app = express();

// Create a REST route
app.get('/api/search-by-firstname/:firstName', async (request, response) => {
  // Read the request parameter firstName
  let { firstName } = request.params;
  // Add a wildcard for LIKE searches in the db
  firstName = '%' + firstName + '%';
  // Make a query as a prepared statement
  const [rows] = await db.execute(`
  SELECT *
  FROM users
  WHERE firstName LIKE :firstName`,
    { firstName }
  );

  // Send the data as json response
  response.json(rows);
});

// Let Express serve all the content from frontend folder
app.use(express.static('frontend'));

// Start the web server at port 3000
app.listen(3000, () => console.log('Listening on http://localhost:3000'));