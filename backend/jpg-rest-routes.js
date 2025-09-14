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
  // Justera dessa nycklar efter hur ni faktiskt skriver metadata i extract-steget
  const fieldMap = {
    fileName: '$.fileName',                 // filnamn
    make: '$.Make',                         // EXIF kameramärke
    model: '$.Model',                       // EXIF kameramodell
    iso: '$.ISO',                           // EXIF ISO
    dateTimeOriginal: '$.DateTimeOriginal', // EXIF fotodatum
    latitude: '$.latitude',                 // latitud (om finns)
    longitude: '$.longitude'                // longitud (om finns)
  };

  // ✅ Lägg sök-rutter FÖRE :id-rutten för att undvika krock
  // GET /api/images/search/:field/:value — sök på tillåtet fält med LIKE
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
        WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, ?)) LIKE ?
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

  // GET /api/images/search?field=fileName&value=DSC — query-variant
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
        WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, ?)) LIKE ?
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
  // 🔒 Begränsa :id till endast siffror för att inte fånga /search
  // Hämta metadata för en specifik bild baserat på id
  // ...другие маршруты этого файла выше

  // Måste ligga sist i filen så att den inte fångar /api/images/near, /api/images/has-gps, etc.
  app.get('/api/images/:id', async (req, res) => {
    const id = Number(req.params.id); // validera att det är ett tal
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'bad id' });
    }
    try {
      const [rows] = await db.execute('SELECT metadata FROM images WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });

      // MySQL kan returnera JSON som objekt; parsa endast om det är en sträng
      const meta = rows[0].metadata;
      const metadata = (typeof meta === 'string') ? JSON.parse(meta) : meta;
      res.json(metadata);
    } catch (err) {
      console.error('GET /api/images/:id failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
