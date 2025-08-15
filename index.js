// Get the database driver
import mysql from 'mysql2/promise';

// Get express so that we can create a web server
import express from 'express';

// Create the connection to database
const db = await mysql.createConnection({
  host: '5.189.183.23',
  port: '4567',
  user: 'ENTER YOUR DB USERNAME',
  password: 'ENTER YOUR DB PASSWORD',
  database: 'ENTER THE NAME OF THE DATABASE'
});

// Allow named placeholders in prepared statements
db.config.namedPlaceholders = true;

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