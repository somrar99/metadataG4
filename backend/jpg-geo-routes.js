// NYA REST-rutter för GEO-sökning bland bilder i tabellen `images`.
// Lägg bara till den här modulen och koppla in den i index.js.
// --------------------------------------------------------

export default function setupImagesGeoRoutes(app, db) {
  // GET /api/images/near?lat=59.33&lon=18.06&radiusKm=50
  // ----------------------------------------------------
  // Syfte: Hitta bilder (JPEG/EXIF) vars GPS-koordinater ligger
  // inom en given radie (km) från en punkt (lat, lon).
  //
  // Förväntar sig att tabellen `images` har en JSON-kolumn `metadata`
  // med fälten "latitude" och "longitude" (t.ex. skapade av exifr).
  //
  // Implementering: Haversine-formeln direkt i SQL (MySQL/MariaDB).
  // Obs: Om vissa bilder saknar GPS -> de filtreras bort automatiskt.
  app.get('/api/images/near', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon);
      const radiusKm = parseFloat(req.query.radiusKm ?? '50');

      // Enkel validering av parametrar
      if (
        Number.isNaN(lat) ||
        Number.isNaN(lon) ||
        Number.isNaN(radiusKm)
      ) {
        return res.status(400).json({
          error: 'Felaktiga parametrar. Använd ?lat=..&lon=..&radiusKm=.. (nummer).'
        });
      }

      // SQL-förklaring:
      // - Vi läser lat/lon från JSON (metadata.latitude/metadata.longitude)
      // - Beräknar avstånd med Haversine (jordradie ≈ 6371 km)
      // - Filtrerar på avstånd <= radiusKm och sorterar närmast först
      const sql = `
        SELECT
          id,
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.file')) AS fileName,
          CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.latitude'))  AS DECIMAL(10,6))  AS latitude,
          CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.longitude')) AS DECIMAL(10,6))  AS longitude,
          distance
        FROM (
          SELECT
            id,
            metadata,
            6371 * ACOS(
              COS(RADIANS(?))
              * COS(RADIANS(CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.latitude'))  AS DECIMAL(10,6))))
              * COS(RADIANS(CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.longitude')) AS DECIMAL(10,6))) - RADIANS(?))
              + SIN(RADIANS(?))
              * SIN(RADIANS(CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.latitude'))  AS DECIMAL(10,6))))
            ) AS distance
          FROM images
          WHERE
            JSON_EXTRACT(metadata,'$.latitude')  IS NOT NULL
            AND JSON_EXTRACT(metadata,'$.longitude') IS NOT NULL
        ) AS t
        WHERE distance <= ?
        ORDER BY distance ASC
      `;

      // Parametrar: [lat, lon, lat, radiusKm]
      const [rows] = await db.execute(sql, [lat, lon, lat, radiusKm]);
      return res.json(rows);
    } catch (err) {
      console.error('GEO-sökning misslyckades:', err);
      return res.status(500).json({ error: 'Internt serverfel' });
    }
  });

  // (Frivilligt) Hjälp-ände för att kontrollera om GPS-data finns
  // GET /api/images/has-gps — räknar hur många bilder som har/inte har koordinater
  app.get('/api/images/has-gps', async (_req, res) => {
    try {
      const sql = `
        SELECT
          SUM(JSON_EXTRACT(metadata,'$.latitude')  IS NOT NULL
            AND JSON_EXTRACT(metadata,'$.longitude') IS NOT NULL) AS withGps,
          COUNT(*) AS total
        FROM images
      `;
      const [rows] = await db.execute(sql);
      return res.json(rows[0]);
    } catch (err) {
      console.error('Koll av GPS-data misslyckades:', err);
      return res.status(500).json({ error: 'Internt serverfel' });
    }
  });
}
