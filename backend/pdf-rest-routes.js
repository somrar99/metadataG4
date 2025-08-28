export default function setupMusicRestRoutes(app, db) {

  app.get('/api/music-search/:field/:searchValue', async (req, res) => {
    // get field and searhValue from the request parameters
    const { field, searchValue } = req.params;
    // check that field is a valid field, if not do nothing
    if (!['title', 'author', 'creator', 'keywords','description' ].includes(field)) {
      res.json({ error: 'Invalid field name!' });
      return;
    }
    // run the db query as a prepared statement
    const [result] = await db.execute(`
    SELECT fileName,
  COALESCE(
    metadata->>'$.info.Title',
    metadata->>'$.xmp.title'
  ) AS title,
  metadata->>'$.info.Author'  AS author,
  metadata->>'$.info.Creator' AS creator,
  metadata->>'$.xmp.keywords' AS keywords,
  metadata->>'$.xmp.description' AS description,
  metadata->>'$.file' AS originalFileName
  FROM pdfs
  WHERE LOWER(metadata->>'$.info.${field}' && '$.xmp.${field}' ) LIKE LOWER(?)
  `, ['%' + searchValue + '%']
    );
    // return the result as json
    res.json(result);
  });

  // get all metadata for a single track (by id)
  app.get('/api/pdf-all-meta/:id', async (req, res) => {
    const { id } = req.params;
    let [result] = await db.execute(`
    SELECT * FROM pdfs WHERE id = ?
  `, [id]);
    res.json(result);
  });

}