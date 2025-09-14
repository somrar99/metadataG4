import express from 'express';
import mysql from 'mysql2/promise';
import dbCredentials from './db-credentials.js';
import setupPdfRestRoutes from './backend/pdf-rest-routes.js';
import setupMusicRestRoutes from './backend/music-rest-routes.js';
import { setupJpgRestRoutes } from './backend/jpg-rest-routes.js';
import setupJpgGeoRoutes from './backend/jpg-geo-routes.js';

//import setupPptRestRoutes from './backend/ppt-rest-routes.js';

// connect to db
const db = await mysql.createConnection(dbCredentials);

// create a web server - app
const app = express();

// add rest routes for pdf search
setupPdfRestRoutes(app, db);

// add rest routes for music search
setupMusicRestRoutes(app, db);

// add rest routes for photo search
setupJpgGeoRoutes(app, db);
setupJpgRestRoutes(app, db); // foton



// Serve files from the frontend folder
app.use(express.static('frontend'));

// Start the web server
app.listen(3010, () => console.log('Listening on http://localhost:3010'));
