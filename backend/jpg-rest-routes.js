/* tilläga i index.js:

"
import setupImagesRestRoutes from './backend/images-rest-routes.js';

// connect to db
const db = await mysql.createConnection(dbCredentials);

// create a web server - app
const app = express();

// add rest routes for music search
setupImagesRestRoutes(app, db);
"

*/



// backend/images-rest-routes.js
// Defines REST routes for working with image metadata stored in the `images` table.
// It exposes three endpoints: list images, get metadata by id, and search by a specific field.

export default function setupImagesRestRoutes(app, db) {
  // GET /api/images — return id and fileName for all images
  app.get('/api/images', async (req, res) => {
    try {
      const sql = `
        SELECT id,
               JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName')) AS fileName
        FROM images
      `;
      const [rows] = await db.execute(sql);
      res.json(rows);
    } catch (err) {
      console.error('Failed to fetch images list:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/images/:id — return full metadata JSON for the given image id
  app.get('/api/images/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await db.execute(
        'SELECT metadata FROM images WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }
      const metadata = JSON.parse(rows[0].metadata);
      res.json(metadata);
    } catch (err) {
      console.error('Failed to fetch image metadata:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // List of allowed fields for searching. Extend this array if needed.
  const allowedFields = [
    'fileName',
    'dateTaken',
    'cameraMake',
    'cameraModel',
    'latitude',
    'longitude'
  ];

  // GET /api/search/:field/:value — search by a given metadata field and value
  app.get('/api/search/:field/:value', async (req, res) => {
    const { field, value } = req.params;
    if (!allowedFields.includes(field)) {
      return res
        .status(400)
        .json({ error: `Unsupported search field: ${field}` });
    }
    try {
      const sql = `
        SELECT id,
               JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName')) AS fileName
        FROM images
        WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.${field}')) LIKE ?
      `;
      const [rows] = await db.execute(sql, [`%${value}%`]);
      res.json(rows);
    } catch (err) {
      console.error('Failed to search images:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
