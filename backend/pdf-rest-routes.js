export default function setupPdfRestRoutes(app, db) {

  app.get('/api/pdf-search/:field/:searchValue', async (req, res) => {
    // get field and searhValue from the request parameters
    let { field, searchValue } = req.params;
    // check that field is a valid field, if not do thing
    let validFields = ['title', 'author', 'creator', 'keywords', 'subject', 'description', 'text'];
    if (!validFields.includes(field)) {
      res.status(400).json({ error: 'Ogiltigt sökfält!' });
      return;
    }
    // Mappa fält till rätt JSON-paths i MySQL
    let fieldMap = {
      // COALESCE(a, b) returnerar det första icke-null värdet mellan a och b
      title: `COALESCE(metadata->>'$.info.Title', metadata->>'$.xmp.title')`,
      author: `metadata->>'$.info.Author'`,
      creator: `COALESCE(metadata->>'$.info.Creator', metadata->>'$.xmp.creator')`,
      keywords: `COALESCE(metadata->>'$.xmp.keywords', metadata->>'$.xmp.keywords')`,
      subject: `COALESCE(metadata->>'$.info.Subject', metadata->>'$.xmp.subject')`,
      description: `metadata->>'$.xmp.description'`,
      text: `metadata->>'$.text'`,
    };

    let fieldExpression = fieldMap[field];
    // Kör sökningen
    let [result] = await db.execute(`
      SELECT 
        id,
        fileName,
        COALESCE(metadata->>'$.info.Title', metadata->>'$.xmp.title') AS title,
        metadata->>'$.info.Author' AS author,
        COALESCE(metadata->>'$.info.Creator', metadata->>'$.xmp.creator') AS creator,
        COALESCE(metadata->>'$.xmp.keywords', metadata->>'$.xmp.keywords') AS keywords,
        COALESCE(metadata->>'$.info.Subject', metadata->>'$.xmp.subject') AS subject,
        metadata->>'$.xmp.description' AS description,
        metadata->>'$.text' AS text
      FROM pdfs
      WHERE LOWER(${fieldExpression}) LIKE LOWER(?)
    `, [`%${searchValue}%`]);

    // return the result as json
    res.json(result);
  });

  // Hämtar all metadata för en viss PDF via id
  app.get('/api/pdf-all-meta/:id', async (req, res) => {
    let { id } = req.params;
    let [result] = await db.execute(`SELECT * FROM pdfs WHERE id = ?`, [id]);
    res.json(result[0] || {});
  });
}