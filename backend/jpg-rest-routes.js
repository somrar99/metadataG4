// backend/jpg-rest-routes.js
// Definierar REST-rutter för bildmetadata i tabellen `images`.
// Endpoints: lista bilder, hämta metadata per id, samt söka på utvalda fält.

export function setupJpgRestRoutes(app, db) {

  // GET /api/images — returnera id och fileName för ett urval av bilder
  app.get('/api/images', async (req, res) => {
    try {
      const sql = `
        SELECT
          id,
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName')) AS fileName
        FROM images
        ORDER BY id DESC
        LIMIT 200
      `;
      const [rows] = await db.execute(sql);
      res.json(rows);
    } catch (err) {
      console.error('GET /api/images failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Whitelist + mappning av sökbara fält till korrekta JSON-paths
  const fieldMap = {
    file: '$.fileName',                  // alias
    fileName: '$.fileName',              // filnamn
    make: '$.Make',                      // EXIF kameramärke
    model: '$.Model',                    // EXIF kameramodell
    iso: '$.ISO',                        // EXIF ISO
    dateTimeOriginal: '$.DateTimeOriginal', // EXIF fotodatum
    latitude: '$.latitude',              // latitud (om finns)
    longitude: '$.longitude'             // longitud (om finns)
  };

  // ✅ Sök med path-parametrar
  // GET /api/images/search/:field/:value
  app.get('/api/images/search/:field/:value', async (req, res) => {
    const { field, value } = req.params;
    const jsonPath = fieldMap[field];
    if (!jsonPath) return res.status(400).json({ error: `Unsupported search field: ${field}` });

    try {
      const sql = `
        SELECT
          id,
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName')) AS fileName
        FROM images
        WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(metadata, ?))) LIKE LOWER(?)
        ORDER BY id DESC
        LIMIT 200
      `;
      const [rows] = await db.execute(sql, [jsonPath, `%${value}%`]);
      res.json(rows);
    } catch (err) {
      console.error('GET /api/images/search/:field/:value failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ✅ Query-variant
  // GET /api/images/search?field=fileName&value=DSC
  app.get('/api/images/search', async (req, res) => {
    const field = req.query.field || 'fileName';
    const value = req.query.value || '';
    const jsonPath = fieldMap[field];
    if (!jsonPath) return res.status(400).json({ error: `Unsupported search field: ${field}` });

    try {
      const sql = `
        SELECT
          id,
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.fileName')) AS fileName
        FROM images
        WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(metadata, ?))) LIKE LOWER(?)
        ORDER BY id DESC
        LIMIT 200
      `;
      const [rows] = await db.execute(sql, [jsonPath, `%${value}%`]);
      res.json(rows);
    } catch (err) {
      console.error('GET /api/images/search (query) failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/images/:id — returnera hela metadata-objektet för en bild
  app.get('/api/images/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'bad id' });
    }
    try {
      const [rows] = await db.execute('SELECT metadata FROM images WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });

      const meta = rows[0].metadata;
      const metadata = (typeof meta === 'string') ? JSON.parse(meta) : meta;
      res.json(metadata);
    } catch (err) {
      console.error('GET /api/images/:id failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
